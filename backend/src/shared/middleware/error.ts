import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '../../infrastructure/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    message: string = 'Something went wrong',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Validation error response
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
  timestamp: string;
}

/**
 * Global error handling middleware
 * Catches all errors and returns standardized error responses
 */
export function errorHandler(
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.headers['x-request-id'] as string || uuidv4();

  // Log the error
  if (err instanceof ApiError) {
    logError(requestId, req.method, req.path, err, err.statusCode);
  } else if (err instanceof ZodError) {
    logError(requestId, req.method, req.path, new Error('Validation error'), 400);
  } else {
    logError(requestId, req.method, req.path, err as Error);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: ValidationErrorDetail[] = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
      requestId,
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Handle API errors
  if (err instanceof ApiError) {
    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: err.statusCode,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      requestId,
      timestamp: new Date().toISOString(),
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const statusCode = (err as any)?.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const errorResponse: ErrorResponse = {
    success: false,
    statusCode,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Something went wrong' : err.message,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.stack,
      }),
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  const requestId = req.headers['x-request-id'] as string || uuidv4();

  const errorResponse: ErrorResponse = {
    success: false,
    statusCode: 404,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(errorResponse);
}
