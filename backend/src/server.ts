import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import volunteerRoutes from './routes/volunteer.routes';
import taskRoutes from './routes/task.routes';
import disasterRoutes from './routes/disaster.routes';
import ivrRoutes from './routes/ivr.routes';
import matchingRoutes from './routes/matching.routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API root
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'SevaSync API v1.0',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      volunteers: '/api/volunteers/*',
      tasks: '/api/tasks/*',
      disasters: '/api/disasters/*',
      ivr: '/api/ivr/*',
      matching: '/api/matching/*'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/matching', matchingRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path
  });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  console.log('SevaSync Backend Server');
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`Volunteers API: http://localhost:${PORT}/api/volunteers`);
  console.log(`Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`Disasters API: http://localhost:${PORT}/api/disasters`);
  console.log(`IVR API: http://localhost:${PORT}/api/ivr`);
  console.log(`Matching API: http://localhost:${PORT}/api/matching`);
  console.log('-'.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
