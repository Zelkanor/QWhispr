/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import {Router} from 'express';

/**
 * Controllers
 */
import register from '@/controllers/v1/auth/register';
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refreshtoken';
import getUser from '@/controllers/v1/auth/getUser';
import logout from '@/controllers/v1/auth/logout';

/**
 * Middlewares
 */
import {loginUserValidator, refreshTokenValidator, registerUserValidator} from '@/middlewares/validator';

import authenticate from '@/middlewares/authenticate';




const router = Router();
router.post('/register',registerUserValidator, register);
router.post('/login', loginUserValidator, login); 
router.post('/refresh',refreshTokenValidator,refreshToken);
router.post('/logout',refreshTokenValidator,logout);
router.get('/user', authenticate, getUser); 
export default router;