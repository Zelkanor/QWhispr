/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */

import { Router } from "express";
const router = Router();

/**
 * Routes
 */
import authRoutes from '@/routes/v1/auth';
import messageRoutes from '@/routes/v1/message';

/**
 * Root route
 */

   router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        code: 'API_LIVE',
        data:{
        message: 'API is live',
        version: '1.0.0',
        documentation: '',
        timestamp : new Date().toISOString(),
        }
        
    });
});

router.use('/auth', authRoutes);
router.use('/conversations',messageRoutes)

router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested route does not exist',
        timestamp: new Date().toISOString(),
    }
  });
});

export default router;