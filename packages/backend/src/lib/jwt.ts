/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import jwt from 'jsonwebtoken';

/**
 * Custom Modules
 */
import config from '@/config';

/**
 * Types
 */

export interface JwtPayload {
  // custom claims
  userId: string;
  deviceId: string;
  sessionId: string;
  
  // Custom claim for token type
  type: 'refresh' | 'access';


  jti: string;   // JWT ID: A unique identifier for the token
  iat: number;   // Issued At: The time the token was issued (Unix timestamp)
  exp: number;   // Expiration Time: The time the token expires (Unix timestamp)
}

export const generateAccessToken = (userId:string,deviceId:string,sessionId:string):string => {
    return jwt.sign(
      { userId, deviceId, sessionId, type: 'access' },
      config.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    
}

export const generateRefreshToken = (userId:string,deviceId:string,sessionId:string,tokenid:string):string => {
    return jwt.sign(
      { userId, deviceId, sessionId, jti: tokenid, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
}

export const verifyAccessToken = (token:string)=> {
    return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;
}

export const verifyRefreshToken = (token:string)=> {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
}