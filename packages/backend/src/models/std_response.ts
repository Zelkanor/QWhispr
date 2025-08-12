/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */


export interface JsonResponse {
    success: boolean;
    message?:string;
    data?: Record<string, any>;
    error?:{
        code: string;
        message:string;
        details?: Record<string, any>;
    }
}