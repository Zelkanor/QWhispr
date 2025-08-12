/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import * as express from 'express';


declare global {
    namespace Express{
        interface Request {
            token?: string;
           user?:{
            id: string;
            deviceId: string;
            sessionId: string;
           }
        }
    }
}