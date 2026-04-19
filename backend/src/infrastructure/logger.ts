import pino from 'pino';

/**
 * Pino Logger Configuration
 * Structured logging for development and production environments
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const loggerConfig = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
  ...(isProduction && {
    serializers: {
      req: (req: any) => ({
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      }),
      res: (res: any) => ({
        statusCode: res.statusCode,
        headers: res.getHeaders?.(),
      }),
    },
  }),
};

/**
 * Create the logger instance
 */
export const logger = pino(loggerConfig);

/**
 * Create child logger with request context
 */
export function createRequestLogger(
  requestId: string,
  method: string,
  path: string
) {
  return logger.child({
    requestId,
    method,
    path,
  });
}

/**
 * Log request
 */
export function logRequest(
  requestId: string,
  method: string,
  path: string,
  query?: any
) {
  const log = createRequestLogger(requestId, method, path);
  log.debug({ query }, `${method} ${path}`);
}

/**
 * Log response
 */
export function logResponse(
  requestId: string,
  method: string,
  path: string,
  statusCode: number,
  responseTime: number
) {
  const log = createRequestLogger(requestId, method, path);
  
  if (statusCode >= 400) {
    log.warn(
      { statusCode, responseTime },
      `${method} ${path} - ${statusCode}`
    );
  } else {
    log.debug(
      { statusCode, responseTime },
      `${method} ${path} - ${statusCode}`
    );
  }
}

/**
 * Log error
 */
export function logError(
  requestId: string,
  method: string,
  path: string,
  error: Error,
  statusCode: number = 500
) {
  const log = createRequestLogger(requestId, method, path);
  log.error(
    {
      statusCode,
      error: {
        message: error.message,
        stack: error.stack,
      },
    },
    `Error in ${method} ${path}`
  );
}

export default logger;
