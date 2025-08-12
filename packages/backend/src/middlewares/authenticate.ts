/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import { verifyAccessToken } from '@/lib/jwt';
import { authService } from '@/services/auth_service';
import { fail } from '@/utils/index';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';
import { AuthErrorCode, SystemErrorCode } from '@/errors';

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  

  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    res.status(401).json(fail('Authorization header missing or invalid format',AuthErrorCode.TOKEN_INVALID));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token) as {
      userId: string;
      deviceId: string;
      sessionId: string;
      type: string;
    };

    if (decoded.type !== 'access') {
      res.status(401).json(fail('Invaid token',AuthErrorCode.TOKEN_INVALID));
      return;
    }
    const sessionActive = await authService.validateSession(decoded.sessionId);
    if (!sessionActive) {
      return res.status(401).json(fail('Session is no longer active', AuthErrorCode.SESSION_EXPIRED));
    }

    req.user = {
      id: decoded.userId,
      deviceId: decoded.deviceId,
      sessionId: decoded.sessionId,
    };

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json(fail('Token expired', AuthErrorCode.TOKEN_EXPIRED));
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json(fail('Invalid token', AuthErrorCode.TOKEN_INVALID));
    } else {
      res.status(500).json(fail('Internal server error', SystemErrorCode.INTERNAL));
      logger.error('Error during authentication', error);
    }
  }
};

export default authenticate;
