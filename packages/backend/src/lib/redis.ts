/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import Redis from 'ioredis';

/**
 * Custom Modules
 */
import config from '@/config';
import { logger } from '@/lib/winston';


class RedisService {
    private static instance: Redis;

    public static getInstance(): Redis 
    {
        if (!RedisService.instance) {
            RedisService.instance = new Redis(config.REDIS_URL,{
                enableReadyCheck: true,
                maxRetriesPerRequest: 3,
                tls: {}
            });
            RedisService.instance.on('connect', () => {
                logger.info('Redis connection established');
            });

            RedisService.instance.on('error', (err) => {
                logger.error('Redis connection error:', err);
            });
        }
        return RedisService.instance;
    }
}

export const redis = RedisService.getInstance();

export const REDIS_KEYS = {
  SESSION: (token: string) => `session:${token}`,
  REFRESH_TOKEN: (hashedToken: string) => `refresh:${hashedToken}`,
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  TOKEN_BLOCKLIST: (jti: string) => `blocklist:${jti}`,
  USER_DEVICES: (userId: string) => `user:${userId}:devices`,
  CONVERSATION_MEMBERS: (conversationId: string) => `conversation:${conversationId}:members`,
  MESSAGE_QUEUE: 'message_queue',
} as const;