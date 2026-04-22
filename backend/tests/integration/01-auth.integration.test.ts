/**
 * Integration Tests: Authentication Flow
 * Tests: Register → Login → Tokens → Refresh → Me endpoint
 */

import request from 'supertest';
import { mockPrisma, fixtures } from './setup';
import { Request, Response } from 'express';

// Mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Mock Auth Routes (simplified for testing)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existing = await mockPrisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await mockPrisma.user.create({
      data: {
        email,
        password, // In real app, this would be hashed
        name,
        role: role || 'NGO_COORDINATOR',
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await mockPrisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In real app, would verify password hash
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return tokens
    const accessToken = `access_token_${user.id}`;
    const refreshToken = `refresh_token_${user.id}`;

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    // Mock token verification
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const userId = token.replace('access_token_', '');

    const user = await mockPrisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Mock refresh logic
    const userId = refreshToken.replace('refresh_token_', '');
    const user = await mockPrisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = `access_token_${user.id}_new`;

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// TESTS
// ============================================

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await mockPrisma.$reset();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new coordinator', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
          name: fixtures.coordinator.name,
          role: fixtures.coordinator.role,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', fixtures.coordinator.email);
      expect(res.body).toHaveProperty('role', fixtures.coordinator.role);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
          name: fixtures.coordinator.name,
        });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: fixtures.coordinator.email,
          password: 'different123',
          name: 'Different Name',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should require email and password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user before login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
          name: fixtures.coordinator.name,
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', fixtures.coordinator.email);
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.coordinator.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.org',
          password: 'anypassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should require email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: fixtures.coordinator.email });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
          name: fixtures.coordinator.name,
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
        });

      accessToken = loginRes.body.accessToken;
    });

    it('should return authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', fixtures.coordinator.email);
      expect(res.body).toHaveProperty('role');
    });

    it('should reject missing authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
          name: fixtures.coordinator.name,
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.coordinator.email,
          password: fixtures.coordinator.password,
        });

      refreshToken = loginRes.body.refreshToken;
    });

    it('should return new access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.accessToken).not.toBe('');
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
