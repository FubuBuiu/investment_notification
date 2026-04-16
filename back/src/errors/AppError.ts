export type ErrorDetails = unknown;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string; // código curto interno (ex: 'AUTH_INVALID', 'P2002')
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 400,
    code?: string,
    details?: ErrorDetails,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  // Helpers estáticos para criar erros comuns
  static badRequest(message = 'Bad Request', details?: ErrorDetails) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Unauthorized', details?: ErrorDetails) {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }
  static forbidden(message = 'Forbidden', details?: ErrorDetails) {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }
  static notFound(message = 'Not Found', details?: ErrorDetails) {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }
  static conflict(message = 'Conflict', details?: ErrorDetails) {
    return new AppError(message, 409, 'CONFLICT', details);
  }
  static validation(message = 'Validation failed', details?: ErrorDetails) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }
  static rateLimit(message = 'Too many requests', details?: ErrorDetails) {
    return new AppError(message, 429, 'RATE_LIMIT', details);
  }
  static externalService(message = 'External service error', details?: ErrorDetails) {
    return new AppError(message, 502, 'EXTERNAL_SERVICE_ERROR', details, false);
  }
  static internal(message = 'Internal server error', details?: ErrorDetails) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details, false);
  }
}
