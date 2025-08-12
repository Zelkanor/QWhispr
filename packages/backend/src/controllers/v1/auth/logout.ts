/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Custom Modules
 */
import { AppError, SystemErrorCode } from '@/errors';
import { logger } from '@/lib/winston';
import { authService } from '@/services/auth_service';
import { fail } from '@/utils';

/**
 * Types
 */
import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.token;
    await authService.logout(token!);
    res.status(204).send();
  } catch (error) {
     if (error instanceof AppError) {
         res.status(error.statusCode).json(fail(error));
       } else {
         res.status(500).json(fail('Login failed', SystemErrorCode.INTERNAL));
         logger.error('Login error:', error);
       }
  }
};

export default logout;
