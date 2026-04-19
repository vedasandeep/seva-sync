import { Response } from 'express';

/**
 * Standardized API response format
 */

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Send a successful response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 */
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  statusCode: number = 200
): void {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  
  const response: ApiResponse<T[]> = {
    success: true,
    statusCode,
    message,
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  error: Error | string,
  message?: string,
  statusCode: number = 400,
  code: string = 'ERROR',
  details?: any
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const response: ApiResponse = {
    success: false,
    statusCode,
    error: {
      code,
      message: message || errorMessage,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Async handler wrapper for route handlers
 * Catches any errors and passes them to error middleware
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
