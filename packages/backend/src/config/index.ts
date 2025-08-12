/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import dotenv from 'dotenv';

/**
 * Types
 */
import type ms from 'ms';


dotenv.config();

const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV ,
    WHITELIST_ORIGINS: ['hi'],
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    REDIS_URL: process.env.REDIS_URL || '',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    HMAC_SALT: process.env.HMAC_SALT !,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m' as ms.StringValue,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY! as ms.StringValue,
    ARGON2_MEM_MB: process.env.ARGON2_MEM_MB ? parseInt(process.env.ARGON2_MEM_MB) : 128,
    ARGON2_TIME_COST: process.env.ARGON2_TIME_COST ? parseInt(process.env.ARGON2_TIME_COST) : 3,
    ARGON2_PARALLELISM:process.env.ARGON2_PARALLELISM ? parseInt(process.env.ARGON2_PARALLELISM) : 1,
};

export default config;