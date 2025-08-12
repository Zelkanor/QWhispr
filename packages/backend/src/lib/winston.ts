/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */


/**
 * Node Modules
 */
import winston from 'winston';

/**
 * Custom Modules
 */
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } = winston.format;

//Define the transports array
const transports: winston.transport[] = [
    new winston.transports.File({
        filename: './logs/error.log',
        level: 'error'
    }),
    new winston.transports.File({
      filename: './logs/combined.log'
    })
];

 if(config.NODE_ENV !== 'production') {
    //Console transport for development
    transports.push(
        new winston.transports.Console({
            format: combine(
                colorize({all: true}),
                timestamp({format: 'YYYY-MM-DD HH:mm:ss A'}),
                align(),
                printf(({timestamp , level, message, ...meta}) => {
                    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} [${level}]: ${message}${metaStr}`;
                })
            ),
        })
    )};

const logger = winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    format: combine(timestamp(),errors({ stack: true }), json()),
    transports,
    silent: config.NODE_ENV === 'test',
});

export { logger };
