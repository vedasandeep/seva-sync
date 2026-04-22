import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';

// Infrastructure
import { env, validateEnv } from './infrastructure/env';
import { logger } from './infrastructure/logger';
import { disconnectDatabase } from './infrastructure/database';

// Shared utilities
import {
  errorHandler,
  notFoundHandler,
} from './shared/middleware';
import { requestIdMiddleware, pinoLoggingMiddleware } from './shared/middleware/logging';
import { sendSuccess } from './shared/utils/responses';

// Services
import { metricsService } from './services/metricsService';

// WebSocket service
import { webSocketService } from './services/webSocketService';

// Module routes
import {
  authRoutes,
  volunteerRoutes,
  taskRoutes,
  disasterRoutes,
  ivrRoutes,
  matchingRoutes,
  dashboardRoutes,
  syncRoutes,
} from './modules';

// Additional routes
import notificationsRoutes from './routes/notifications.routes';
import auditLogsRoutes from './routes/auditLogs.routes';
import usersRoutes from './routes/users.routes';

const app: Application = express();

// Validate environment on startup
try {
  validateEnv();
  logger.info('Environment variables validated successfully');
} catch (error) {
  logger.error(error, 'Failed to validate environment variables');
  process.exit(1);
}

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

// ============================================
// MIDDLEWARE
// ============================================

// Request ID tracking
app.use(requestIdMiddleware);

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.trim())) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(pinoLoggingMiddleware());

// Global rate limiting (exclude IVR webhooks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/ivr'), // Skip rate limiting for IVR webhooks
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  }, 'Health check passed');
});

// Metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await metricsService.getMetrics();
    const health = await metricsService.getHealthStatus();
    sendSuccess(res, {
      ...metrics,
      health,
    }, 'Metrics retrieved successfully');
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message,
    });
  }
});

// API root
app.get('/api', (_req: Request, res: Response) => {
  sendSuccess(res, {
    message: 'SevaSync API v1.0',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      auth: '/api/auth/*',
      users: '/api/users/*',
      volunteers: '/api/volunteers/*',
      tasks: '/api/tasks/*',
      disasters: '/api/disasters/*',
      ivr: '/api/ivr/*',
      matching: '/api/matching/*',
      notifications: '/api/notifications/*',
      auditLogs: '/api/audit-logs/*',
      dashboard: '/api/dashboard/*',
      sync: '/api/v1/sync/*'
    }
  }, 'SevaSync API');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/sync', syncRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

// Create HTTP server with Express and Socket.io
const httpServer = http.createServer(app);

// Initialize WebSocket
const corsOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
webSocketService.initializeWebSocket(httpServer, corsOrigins);

httpServer.listen(PORT, () => {
  logger.info(`SevaSync Backend Server started`);
  logger.info(`Running on: http://localhost:${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Metrics: http://localhost:${PORT}/metrics`);
  logger.info(`Auth API: http://localhost:${PORT}/api/auth`);
  logger.info(`Volunteers API: http://localhost:${PORT}/api/volunteers`);
  logger.info(`Tasks API: http://localhost:${PORT}/api/tasks`);
  logger.info(`Disasters API: http://localhost:${PORT}/api/disasters`);
  logger.info(`IVR API: http://localhost:${PORT}/api/ivr`);
  logger.info(`Matching API: http://localhost:${PORT}/api/matching`);
  logger.info(`WebSocket API: ws://localhost:${PORT}`);
  logger.info('-'.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    await disconnectDatabase();
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    await disconnectDatabase();
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
export { httpServer };
