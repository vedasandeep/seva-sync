import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import logger, { logRequest, logResponse } from '../../infrastructure/logger';

/**
 * Request ID middleware
 * Attaches a unique ID to each request for tracing
 */
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  (req as any).id = requestId;
  (req as any).logger = logger.child({ requestId });
  next();
}

/**
 * Request/Response logging middleware
 * Logs HTTP requests and responses with timing
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req as any).id || uuidv4();
  const start = Date.now();

  logRequest(requestId, req.method, req.path, req.query);

  // Intercept response.json to log the response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const duration = Date.now() - start;
    logResponse(requestId, req.method, req.path, res.statusCode, duration);
    return originalJson(body);
  };

  next();
}

/**
 * Alternative: Use pino-http for automatic HTTP logging
 * This is the recommended approach for production
 */
export function pinoLoggingMiddleware() {
  return pinoHttp({
    logger,
    customLogLevel: (_req, res, _err) => {
      if (res.statusCode >= 400) {
        return 'error';
      }
      return 'info';
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
    },
    genReqId: (req) => (req.headers['x-request-id'] as string) || uuidv4(),
  });
}
