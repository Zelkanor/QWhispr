/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

/**
 * Custom Modules
 */
import config from '@/config';
import rateLimiter from '@/lib/express_rate_limit';
import prisma from '@/lib/prismaClient';
import { logger } from '@/lib/winston';
/**
 * Router
 */
import v1Routes from '@/routes/v1/';
/**
 * Types
 */
import type { CorsOptions } from 'cors';

/**
 * Initialize Express App
 */
const app = express();

//Configure CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn('CORS error: Origin not allowed', { origin });
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

//Apply CORS middleware
app.use(cors(corsOptions));

//Parse JSON bodies
app.use(express.json());

//Parse cookie bodies
app.use(cookieParser());

//Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//Enable response compression to reduce payload size
app.use(
  compression({
    threshold: 1024, // Compress responses larger than 1KB
  }),
);

// Set security-related HTTP headers
app.use(helmet());

// Apply rate limiting to all requests
app.use(rateLimiter);

// --- Server Startup ---
(async () => {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to the database.');
    app.use('/api/v1', v1Routes);
    app.listen(3000, () => {
      logger.info(`Server is running on http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    // Ensure Prisma disconnects if the startup fails after connection
    await prisma.$disconnect();
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

// --- Graceful Shutdown ---
const shutdown = async () => {
  try {
    logger.warn('Shutting down server');
    await prisma.$disconnect();
    logger.info('Successfully disconnected from the database.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
