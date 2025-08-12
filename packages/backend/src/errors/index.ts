/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

export enum AuthErrorCode {
  LOGIN_INVALID_CREDENTIALS = 'auth/login-invalid-credentials',
  LOGIN_ACCOUNT_DISABLED = 'auth/login-account-disabled',
  REGISTER_EMAIL_IN_USE = 'auth/register-email-in-use',
  REGISTER_USERNAME_IN_USE = 'auth/register-username-in-use',
  TOKEN_INVALID = 'auth/token-invalid',
  TOKEN_EXPIRED = 'auth/token-expired',
  TOKEN_REVOKED = 'auth/token-revoked',
  SESSION_EXPIRED = 'auth/session-expired',
  UNAUTHORIZED = 'auth/unauthorized',
  FORBIDDEN = 'auth/forbidden',
}

export enum ValidationErrorCode {
  INVALID_INPUT = 'requests/invalid-input',
  MISSING_FIELD = 'requests/missing-field',
}

export enum ResourceErrorCode {
  NOT_FOUND = 'resource/not-found',
  CONFLICT = 'resource/conflict',
  ALREADY_EXISTS = 'resource/already-exists',
  RATE_LIMITED = 'resource/rate-limited',
}

export enum SecurityErrorCode {
  SUSPICIOUS_ACTIVITY = 'security/suspicious-activity',
  KEY_ROTATION_REQUIRED = 'security/key-rotation-required',
}

export enum SystemErrorCode {
  INTERNAL = 'system/internal-error',
  DEPENDENCY_DOWN = 'system/dependency-down',
  TIMEOUT = 'system/timeout',
}


export class AppError extends Error {
  public readonly success = false;
  public readonly code: string;
  public readonly statusCode: number;
  public override readonly message: string;
  public readonly details?: Record<string, any> | Record<string, any>[];

  constructor(opts: {
    code: string;
    statusCode?: number;
    message: string;
    details?: Record<string, any> | Record<string, any>[];
  }) {
    super(opts.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = opts.code;
    this.message = opts.message;
    this.statusCode = opts.statusCode ?? 500;
    this.details = opts.details;
    Error.captureStackTrace?.(this);
  }
}

export class ValidationError extends AppError {
  constructor( opts: {
      message?: string;
      details?: { field: string; message: string }[];
    } = {}) {
    super({
      code: ValidationErrorCode.INVALID_INPUT,
      message: opts.message ?? 'Validation failed',
      details: opts.details,
    });
  }
}

export class AuthError extends AppError {
  constructor( opts: {
      code?: AuthErrorCode | ResourceErrorCode;
      statusCode?: number;
      message?: string;
      details?: { field: string; message: string }[];
    } = {}) {
    super({
      code: opts.code ?? AuthErrorCode.FORBIDDEN,
      message: opts.message ?? 'Validation failed',
      details: opts.details,
      statusCode: opts.statusCode ?? 403,
    });
  }
}


export class InternalError extends AppError {
  constructor(
    message = 'Internal server error',
    details?: Record<string, any>,
  ) {
    super({
      code: SystemErrorCode.INTERNAL,
      message,
      details,
    });
  }
}

