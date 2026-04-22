/**
 * Metrics Service
 * Provides real-time metrics about the system health and performance
 */

import { prisma } from '../infrastructure/database';
import { logger } from '../infrastructure/logger';

export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    usersCount: number;
    volunteersCount: number;
    disastersCount: number;
    tasksCount: number;
    pendingTasksCount: number;
    completedTasksCount: number;
    notificationsCount: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    memoryLimit: number;
  };
  api: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

class MetricsService {
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;

  /**
   * Get comprehensive system metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    try {
      const uptime = (Date.now() - this.startTime) / 1000; // seconds

      // Database metrics
      const [
        usersCount,
        volunteersCount,
        disastersCount,
        tasksCount,
        pendingTasksCount,
        completedTasksCount,
        notificationsCount,
      ] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.volunteer.count().catch(() => 0),
        prisma.disaster.count().catch(() => 0),
        prisma.task.count().catch(() => 0),
        prisma.task
          .count({ where: { status: 'OPEN' } })
          .catch(() => 0),
        prisma.task
          .count({ where: { status: 'COMPLETED' } })
          .catch(() => 0),
        prisma.notification.count().catch(() => 0),
      ]);

      // System metrics
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();

      // API metrics
      const avgResponseTime =
        this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
      const errorRate =
        this.requestCount > 0
          ? (this.errorCount / this.requestCount) * 100
          : 0;

      return {
        timestamp: new Date().toISOString(),
        uptime,
        environment: process.env.NODE_ENV || 'development',
        database: {
        status: 'connected',
        usersCount,
        volunteersCount,
        disastersCount,
        tasksCount,
        pendingTasksCount,
        completedTasksCount,
        notificationsCount,
      },
        system: {
          cpuUsage: cpuUsage.user + cpuUsage.system,
          memoryUsage: memoryUsage.heapUsed,
          memoryLimit: memoryUsage.heapTotal,
        },
        api: {
          requestsPerMinute: Math.round((this.requestCount / uptime) * 60),
          errorRate: Math.round(errorRate * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        },
      };
    } catch (error) {
      logger.error(error, 'Failed to get metrics');
      throw error;
    }
  }

  /**
   * Track API request for metrics
   */
  trackRequest(responseTime: number, isError: boolean = false): void {
    this.requestCount++;
    this.totalResponseTime += responseTime;
    if (isError) {
      this.errorCount++;
    }
  }

  /**
   * Get health status summary
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      database: boolean;
      api: boolean;
      memory: boolean;
    };
  }> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      // Try database connection
      let dbHealthy = true;
      try {
        await prisma.user.count({ take: 1 });
      } catch {
        dbHealthy = false;
      }

      const apiHealthy = this.errorCount < this.requestCount * 0.1; // Less than 10% error rate
      const memoryHealthy = memoryPercent < 90; // Less than 90% memory usage

      const checks = {
        database: dbHealthy,
        api: apiHealthy,
        memory: memoryHealthy,
      };

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      const failedChecks = Object.values(checks).filter((v) => !v).length;

      if (failedChecks === 3) {
        status = 'unhealthy';
      } else if (failedChecks > 0) {
        status = 'degraded';
      }

      return { status, checks };
    } catch (error) {
      logger.error(error, 'Failed to check health status');
      return {
        status: 'unhealthy',
        checks: { database: false, api: false, memory: false },
      };
    }
  }
}

export const metricsService = new MetricsService();
