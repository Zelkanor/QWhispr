/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import {rateLimit} from 'express-rate-limit';

//Configure rate limiting
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'You have sent too many requests in a given amount of time. Please try again later.',
    },
});

export default rateLimiter;