/**
 * Test Fixtures and Factories
 * 
 * Provides reusable test data builders following the Factory pattern
 */

import { faker } from '@faker-js/faker';

/**
 * User/Volunteer Test Data Factory
 */
export const createMockVolunteer = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  phone: faker.phone.number('+91##########'),
  email: faker.internet.email(),
  role: 'VOLUNTEER',
  language: 'en',
  latitude: 17.385044,
  longitude: 78.486671,
  skills: ['first-aid', 'cooking'],
  isAvailable: true,
  hoursWorked: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

/**
 * Task Test Data Factory
 */
export const createMockTask = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  location: faker.location.city(),
  latitude: faker.location.latitude(),
  longitude: faker.location.longitude(),
  status: 'OPEN',
  priority: 'MEDIUM',
  requiredSkills: ['first-aid'],
  estimatedHours: 2,
  createdById: faker.string.uuid(),
  assignedToId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

/**
 * JWT Token Factory
 */
export const createMockToken = (payload?: any) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      userId: faker.string.uuid(),
      role: 'VOLUNTEER',
      ...payload
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

/**
 * Express Request Mock
 */
export const createMockRequest = (overrides?: any) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides
});

/**
 * Express Response Mock
 */
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Express Next Function Mock
 */
export const createMockNext = () => jest.fn();

/**
 * Database Mock Helpers
 */
export const createMockPrismaClient = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
});

/**
 * Redis Mock Helpers
 */
export const createMockRedisClient = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  expire: jest.fn(),
  quit: jest.fn(),
});

/**
 * Wait Helper for async operations
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Suppress console errors in specific tests
 */
export const suppressConsoleError = (testFn: () => void | Promise<void>) => {
  return async () => {
    const originalError = console.error;
    console.error = jest.fn();
    try {
      await testFn();
    } finally {
      console.error = originalError;
    }
  };
};
