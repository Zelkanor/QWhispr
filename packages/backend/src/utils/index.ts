/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Custom Modules
 */
import { JsonResponse } from '@/models/std_response';
import { AppError } from '@/errors/index';

/**
 * Types
 */
import type { SafeParseReturnType } from 'zod';
import {
  AuthErrorCode,
  ValidationErrorCode,
  ResourceErrorCode,
  SecurityErrorCode,
  SystemErrorCode,
} from '@/errors/index';

/**
 * Ensure consistent response structure
 */
export function fail(
  message: string,
  errorCode:
    | AuthErrorCode
    | ValidationErrorCode
    | ResourceErrorCode
    | SecurityErrorCode
    | SystemErrorCode,
  details?: Record<string, any> | Record<string, any>[],
): JsonResponse;
export function fail(error: AppError): JsonResponse;

export function fail(
  arg1: string | AppError,
  arg2?: string,
  arg3?: Record<string, any> | Record<string, any>[],
): JsonResponse {
  if (typeof arg1 === 'string') { 
    const message = arg1;
    const errorCode = arg2!;
    return {
      success: false,
      error: {
        code: errorCode,
        message,
        details: arg3,
      },
    };
  } else {
    const error = arg1;
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }
}

export const ok = (
  message = 'OK',
  data?: Record<string, any>,
): JsonResponse => ({
  success: true,
  message,
  data,
});

export const created = (
  message = 'Created',
  data?: Record<string, any>,
): JsonResponse => ({
  success: true,
  message,
  data,
});

/**
 * Extract error details from Zod validation result
 */
export const errorDetails = (
  data: SafeParseReturnType<any, any>,
): { field: string; message: string }[] => {
  if (!data.success && data.error) {
    return data.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  return [];
};

/**
 * Generate a random username(e.g. user-abc123))
 */
export const genUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomSuffix = Math.random().toString(36).slice(2);
  const username = usernamePrefix + randomSuffix;
  return username;
};
