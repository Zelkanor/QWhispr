/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Custom Modules
 */
import { authService } from '@/services/auth_service';
import { logger } from '@/lib/winston';
import { fail, ok } from '@/utils';

/**
 * Types
 */
import type { Request, Response } from 'express';
import { AppError, SystemErrorCode } from '@/errors';


const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const {user,tokens} = await authService.loginUser({
      email: req.body.email,
      password: req.body.password,
      deviceFingerprint: req.body.deviceFingerprint,
    });

    res.status(200).json(ok('Login successful', {user,tokens}));
  } catch (error) {
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json(fail(error));
    } else {
      res.status(500).json(fail('Login failed', SystemErrorCode.INTERNAL));
      logger.error('Login error:', error);
    }
     
  }
};

export default login;
