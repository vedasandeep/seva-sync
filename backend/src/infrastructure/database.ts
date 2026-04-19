import { PrismaClient } from '@prisma/client';
import logger from './logger';

/**
 * Database connection management
 * Uses Prisma Client with singleton pattern
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const database: PrismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ]
      : [
          {
            emit: 'event',
            level: 'error',
          },
        ],
  });

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  (database as any).$on('query', (e: any) => {
    logger.debug(
      {
        query: e.query,
        params: e.params,
        duration: e.duration,
      },
      'Database query'
    );
  });

  (database as any).$on('error', (e: any) => {
    logger.error(
      {
        message: e.message,
        code: e.code,
      },
      'Database error'
    );
  });

  (database as any).$on('warn', (e: any) => {
    logger.warn(
      {
        message: e.message,
      },
      'Database warning'
    );
  });
}

// Keep singleton
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = database;
}

/**
 * Graceful database disconnection
 */
export async function disconnectDatabase() {
  await database.$disconnect();
  logger.info('Database disconnected');
}

// Alias for backward compatibility
export const prisma = database;

export default database;
