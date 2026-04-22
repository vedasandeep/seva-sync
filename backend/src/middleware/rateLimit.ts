import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: Array<{ timestamp: number; count: number }>;
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful responses
  skipFailedRequests?: boolean; // Don't count failed responses
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Rate limit middleware
 * Default: IP-based rate limiting
 */
export function rateLimit(options: RateLimitOptions) {
   return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Generate rate limit key (default: IP address)
    const key = options.keyGenerator ? options.keyGenerator(req) : req.ip || 'unknown';

    // Initialize store for this key if not exists
    if (!store[key]) {
      store[key] = [];
    }

    // Remove expired entries
    store[key] = store[key].filter((entry) => entry.timestamp > windowStart);

    // Check if limit exceeded
    const requestCount = store[key].reduce((sum, entry) => sum + entry.count, 0);

    if (requestCount >= options.maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${options.maxRequests} requests per ${options.windowMs / 1000}s allowed`,
        retryAfter: Math.ceil((store[key][0].timestamp + options.windowMs - now) / 1000),
      });
      return;
    }

    // Record this request
    store[key].push({ timestamp: now, count: 1 });

    // Capture original send to check response status
    const originalSend = res.send;
    res.send = function (data: any) {
      const isSuccess = res.statusCode < 400;
      const isFailed = res.statusCode >= 400;

      // Skip counting based on response status if configured
      if ((options.skipSuccessfulRequests && isSuccess) || (options.skipFailedRequests && isFailed)) {
        const lastEntry = store[key][store[key].length - 1];
        if (lastEntry) {
          lastEntry.count = 0; // Don't count this request
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * User-based rate limiting
 * Limits requests per authenticated user
 */
export function userRateLimit(options: RateLimitOptions) {
  return rateLimit({
    ...options,
    keyGenerator: (req: Request) => req.user?.userId || req.ip || 'unknown',
  });
}

/**
 * Combined rate limiter with both IP and user tracking
 */
export function combinedRateLimit(options: { ipLimit: RateLimitOptions; userLimit: RateLimitOptions }) {
   return [
    rateLimit(options.ipLimit),
    (req: Request, res: Response, next: NextFunction): void => {
      // Only apply user limit if authenticated
      if (req.user) {
        userRateLimit(options.userLimit)(req, res, next);
        return;
      }
      next();
    },
  ];
}

/**
 * Login attempt rate limiter
 * Blocks after N failed attempts
 */
export function loginRateLimit(options: { maxAttempts: number; windowMs: number }) {
   return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const email = req.body?.email;
    const ipAddress = req.ip || 'unknown';

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const ipKey = `login_ip_${ipAddress}`;
    const userKey = `login_user_${email}`;

    // Check IP-based limits
    if (!store[ipKey]) store[ipKey] = [];
    store[ipKey] = store[ipKey].filter((entry) => entry.timestamp > windowStart);

    if (store[ipKey].length >= options.maxAttempts) {
      res.status(429).json({
        error: 'Too many login attempts',
        message: `Too many failed login attempts from this IP. Try again in ${Math.ceil((store[ipKey][0].timestamp + options.windowMs - now) / 1000)}s`,
        retryAfter: Math.ceil((store[ipKey][0].timestamp + options.windowMs - now) / 1000),
      });
      return;
    }

    // Check user-based limits
    if (!store[userKey]) store[userKey] = [];
    store[userKey] = store[userKey].filter((entry) => entry.timestamp > windowStart);

    if (store[userKey].length >= options.maxAttempts) {
      res.status(429).json({
        error: 'Too many login attempts',
        message: `Too many failed login attempts for this account. Try again in ${Math.ceil((store[userKey][0].timestamp + options.windowMs - now) / 1000)}s`,
        retryAfter: Math.ceil((store[userKey][0].timestamp + options.windowMs - now) / 1000),
      });
      return;
    }

    // Capture original send to track failed attempts
    const originalSend = res.send;
    res.send = function (data: any) {
      // Record failed login attempts
      if (res.statusCode === 401) {
        store[ipKey].push({ timestamp: now, count: 1 });
        store[userKey].push({ timestamp: now, count: 1 });
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Reset rate limit for a specific key (useful for admin)
 */
export function resetRateLimit(key: string): void {
  delete store[key];
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitStatus(key: string): { remaining: number; reset: number } | null {
  const entries = store[key];
  if (!entries) return null;

  return {
    remaining: Math.max(0, 100 - entries.length),
    reset: entries.length > 0 ? entries[0].timestamp + 60000 : Date.now() + 60000,
  };
}

export default rateLimit;
