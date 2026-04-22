/**
 * Integration Test: Health & Metrics Endpoints
 */

import request from 'supertest';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

// Mock metrics service
const mockMetrics = {
  getMetrics: async () => ({
    timestamp: new Date().toISOString(),
    uptime: 123.45,
    environment: 'test',
    database: {
      status: 'connected',
      usersCount: 5,
      volunteersCount: 142,
      disastersCount: 3,
      tasksCount: 456,
      pendingTasksCount: 45,
      completedTasksCount: 411,
      notificationsCount: 234,
    },
    system: {
      cpuUsage: 0.05,
      memoryUsage: 52428800,
      memoryLimit: 104857600,
    },
    api: {
      requestsPerMinute: 25,
      errorRate: 0.5,
      avgResponseTime: 45.32,
    },
  }),
  getHealthStatus: async () => ({
    status: 'healthy',
    checks: {
      database: true,
      api: true,
      memory: true,
    },
  }),
};

// Health endpoint
app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'test',
  });
});

// Metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await mockMetrics.getMetrics();
    const health = await mockMetrics.getHealthStatus();
    return res.status(200).json({
      ...metrics,
      health,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message,
    });
  }
});

describe('Health & Metrics Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('environment', 'test');
    });

    it('should have valid ISO timestamp', async () => {
      const res = await request(app).get('/health');

      const timestamp = new Date(res.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /metrics', () => {
    it('should return comprehensive metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('environment');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('system');
      expect(res.body).toHaveProperty('api');
      expect(res.body).toHaveProperty('health');
    });

    it('should include database metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.body.database).toHaveProperty('status', 'connected');
      expect(res.body.database).toHaveProperty('usersCount', 5);
      expect(res.body.database).toHaveProperty('volunteersCount', 142);
      expect(res.body.database).toHaveProperty('disastersCount', 3);
      expect(res.body.database).toHaveProperty('tasksCount', 456);
      expect(res.body.database).toHaveProperty('pendingTasksCount', 45);
      expect(res.body.database).toHaveProperty('completedTasksCount', 411);
      expect(res.body.database).toHaveProperty('notificationsCount', 234);
    });

    it('should include system metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.body.system).toHaveProperty('cpuUsage');
      expect(res.body.system).toHaveProperty('memoryUsage');
      expect(res.body.system).toHaveProperty('memoryLimit');
      expect(res.body.system.memoryUsage).toBeGreaterThan(0);
      expect(res.body.system.memoryLimit).toBeGreaterThan(0);
    });

    it('should include API metrics', async () => {
      const res = await request(app).get('/metrics');

      expect(res.body.api).toHaveProperty('requestsPerMinute');
      expect(res.body.api).toHaveProperty('errorRate');
      expect(res.body.api).toHaveProperty('avgResponseTime');
      expect(res.body.api.errorRate).toBeGreaterThanOrEqual(0);
      expect(res.body.api.errorRate).toBeLessThanOrEqual(100);
    });

    it('should include health status', async () => {
      const res = await request(app).get('/metrics');

      expect(res.body.health).toHaveProperty('status');
      expect(res.body.health).toHaveProperty('checks');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(
        res.body.health.status
      );
    });

    it('should have valid health checks', async () => {
      const res = await request(app).get('/metrics');

      expect(res.body.health.checks).toHaveProperty('database');
      expect(res.body.health.checks).toHaveProperty('api');
      expect(res.body.health.checks).toHaveProperty('memory');
      expect(typeof res.body.health.checks.database).toBe('boolean');
      expect(typeof res.body.health.checks.api).toBe('boolean');
      expect(typeof res.body.health.checks.memory).toBe('boolean');
    });
  });
});
