/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import config from '@/config';
import prisma from '@/lib/prismaClient';
import { redis, REDIS_KEYS } from '@/lib/redis';
import { quantumCrypto } from '@/lib/quantum_crypt';
import {
  generateAccessToken,
  verifyRefreshToken,
  generateRefreshToken,
  JwtPayload,
} from '@/lib/jwt';
/**
 * Models
 */
import { LoginSchemaType, RegisterSchemaType } from '@/models/authentication';
/**
 * Types
 */

import { AuthError, AuthErrorCode, ResourceErrorCode } from '@/errors';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  public async registerUser(data: RegisterSchemaType) {
    try {
      //Check existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
        },
      });

      if (existingUser) {
        throw new AuthError({
          statusCode: 409,
          code:
            existingUser.email === data.email
              ? AuthErrorCode.REGISTER_EMAIL_IN_USE
              : AuthErrorCode.REGISTER_USERNAME_IN_USE,
          message: 'Email or username already in use',
        });
      }

      const passwordHash = await argon2.hash(data.password, {
        type: argon2.argon2id,
        memoryCost: config.ARGON2_MEM_MB,
        timeCost: config.ARGON2_TIME_COST,
        parallelism: config.ARGON2_PARALLELISM,
      });

      // Generate quantum keys for first device
      //TODO: Ensure key security when storing in db
      const { publicKey: pqPubKey } = quantumCrypto.generateQuantumKeyPair();
      const dsaKeys = quantumCrypto.generateDsaKeyPair();
      // Create user
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            username: data.username,
            passwordHash,
          },
        });

        // Create first device with quantum keys
        await tx.device.create({
          data: {
            userId: newUser.id,
            deviceFingerprint: data.deviceFingerprint,
            pqPubKey,
            pqSignPubKey: dsaKeys.publicKey,
          },
        });

        return newUser;
      });

      logger.info(`✅ User registered: ${user.email}`);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
      };
    } catch (error) {
      logger.error('❌ User registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user and create session
   */
  public async loginUser(data: LoginSchemaType): Promise<{
    user: {
      id: string;
      email: string;
      username: string;
      isActive: boolean;
    };
    tokens: AuthTokens;
  }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        passwordHash: true,
        devices: {
          select: {
            id: true,
            deviceFingerprint: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AuthError({
        statusCode: 401,
        code: AuthErrorCode.LOGIN_INVALID_CREDENTIALS,
        message: 'Invalid credentials or account inactive',
      });
    }

    // Verify password
    const isValidPassword = await argon2.verify(
      user.passwordHash,
      data.password,
    );
    if (!isValidPassword) {
      throw new AuthError({
        statusCode: 401,
        code: AuthErrorCode.LOGIN_INVALID_CREDENTIALS,
        message: 'Wrong password',
      });
    }

    // Find or create device
    let device = user.devices.find(
      (d) => d.deviceFingerprint === data.deviceFingerprint,
    );
    if (!device) {
      const { publicKey: pqPubKey } = quantumCrypto.generateQuantumKeyPair();
      const dsaKeys = quantumCrypto.generateDsaKeyPair();
      device = await prisma.device.create({
        data: {
          userId: user.id,
          deviceFingerprint: data.deviceFingerprint,
          pqPubKey,
          pqSignPubKey: dsaKeys.publicKey,
        },
      });
    }
    const tokens = await this.createSessionAndTokens(
      prisma,
      user.id,
      device.id,
    );
    const { devices, passwordHash, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Refresh access token
   */
  public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthError({
        statusCode: 401,
        code: AuthErrorCode.TOKEN_INVALID,
        message: 'Invalid refresh token',
      });
    }
    const { jti, exp } = payload;
    //Check if the token has been revoked (is on the blocklist)
    const isRevoked = await redis.get(REDIS_KEYS.TOKEN_BLOCKLIST(payload.jti));
    if (isRevoked) {
      throw new AuthError({
        statusCode: 401,
        code: AuthErrorCode.TOKEN_REVOKED,
        message: 'Token has been revoked',
      });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: { session: true },
    });

    if (
      !tokenRecord ||
      !tokenRecord.session ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new AuthError({
        statusCode: 401,
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: 'Token expired or revoked',
      });
    }

    const timeRemaining = exp - Math.floor(Date.now() / 1000);
    if (timeRemaining > 0) {
      await redis.set(
        REDIS_KEYS.TOKEN_BLOCKLIST(jti),
        'revoked',
        'EX',
        timeRemaining,
      );
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    return this.issueTokens(
      tokenRecord.session!.userId,
      tokenRecord.session!.deviceId,
      tokenRecord.session!.id,
    );
  }

  /**
   * LOGOUT (Revoke Session)
   */
  public async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const { jti, exp, sessionId } = payload;

      const isRevoked = await redis.get(REDIS_KEYS.TOKEN_BLOCKLIST(jti));
      if (isRevoked) {
        throw new AuthError({
          code: AuthErrorCode.TOKEN_REVOKED,
          message: 'This token has already been used or revoked.',
        });
      }

      // 1. Add the token's JTI to the blocklist with its remaining expiry time
      const timeRemaining = exp - Math.floor(Date.now() / 1000);
      if (timeRemaining > 0) {
        await redis.set(
          REDIS_KEYS.TOKEN_BLOCKLIST(jti),
          'revoked',
          'EX',
          timeRemaining,
        );
      }
      if (sessionId) {
        await prisma.$transaction([
          // Delete all refresh tokens associated with the session
          prisma.refreshToken.deleteMany({ where: { sessionId: sessionId } }),

          // Delete the session itself
          prisma.session.delete({ where: { id: sessionId } }),
        ]);
        await redis.del(REDIS_KEYS.SESSION(sessionId));
      }
      logger.info(`✅ Session logged out for user: ${payload.userId}`);
    } catch (error) {
      logger.error('❌ Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get user
   */
  public async getUser(userId: string):Promise<{
      id: string;
      email: string;
      username: string;
      isActive: boolean;
  
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      }
    });

    if (!user) {
    throw new AuthError({statusCode: 404,code:ResourceErrorCode.NOT_FOUND, message: 'User not found'});
  }
  return user;
  }
  /**
   * Validate if a session is active and not revoked or expired.
   * First checks Redis cache for performance, then DB as fallback.
   * @param sessionId - The session UUID to validate
   * @returns true if session exists and valid else false
   */
  public async validateSession(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;

    try {
      // First try Redis cache by session token key
      const sessionCache = await redis.get(REDIS_KEYS.SESSION(sessionId));
      if (sessionCache) {
        return true;
      }

      // Cache miss: Check DB for session existence and expiry
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) return false;

      // Check if session expired or revoked (isRevoked optional in schema)
      if (session.expiresAt < new Date()) return false;

      // If valid, cache for faster future lookups (cache for remaining ttl)
      const ttlSeconds = Math.floor(
        (session.expiresAt.getTime() - Date.now()) / 1000,
      );
      if (ttlSeconds > 0) {
        await redis.setex(
          REDIS_KEYS.SESSION(sessionId),
          ttlSeconds,
          JSON.stringify({
            userId: session.userId,
            deviceId: session.deviceId,
            sessionId: session.id,
          }),
        );
      }

      return true;
    } catch (err) {
      logger.error('Error validating session', err);
      return false;
    }
  }
  /**
   * PRIVATE — Create Session + Tokens
   */
  private async createSessionAndTokens(
    db: typeof prisma,
    userId: string,
    deviceId: string,
  ): Promise<AuthTokens> {
    const session = await db.session.create({
      data: {
        userId,
        deviceId,
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });
    await redis.setex(
      REDIS_KEYS.SESSION(session.token),
      15 * 60, // 15 minutes in seconds
      JSON.stringify({ userId, deviceId, sessionId: session.id }),
    );
    return this.issueTokens(userId, deviceId, session.id);
  }

  /**
   * PRIVATE — Issue JWT Access & Refresh tokens
   */
  private async issueTokens(
    userId: string,
    deviceId: string,
    sessionId: string,
  ): Promise<AuthTokens> {
    const accessToken = generateAccessToken(userId, deviceId, sessionId);

    const refreshTokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(
      userId,
      deviceId,
      sessionId,
      refreshTokenId,
    );

    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        sessionId,
        hashedToken: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
export const authService = AuthService.getInstance();
