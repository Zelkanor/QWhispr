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

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';



const router = Router();
// Apply authentication to all messaging routes
router.use(authenticate);
/**
 * POST /conversations
 * Create a new conversation
 */
router.post('/', register);
/**
 * GET /conversations
 * Get user's conversations
 */
router.get('/', login); 
/**
 * POST /conversations/:id/messages
 * Send a message
 */
router.post('/:id/messages',refreshToken);
/**
 * GET /conversations/:id/messages
 * Get conversation messages
 */
router.get('/:id/messages',login);
/**
 * PATCH /messages/:id/read
 * Mark message as read
 */
router.patch('/messages/:id/read',login);
export default router;