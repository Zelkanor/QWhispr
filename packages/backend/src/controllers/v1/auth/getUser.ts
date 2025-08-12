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


const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.getUser(req.user?.id!);
    res.status(200).json(ok('User info recovered', {user}));
  } catch (error) {
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json(fail(error));
    } else {
      res.status(500).json(fail('User Get Failed', SystemErrorCode.INTERNAL));
      logger.error('User Get failed:', error);
    }
     
  }
};

export default getUser;
