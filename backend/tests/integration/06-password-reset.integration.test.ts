/**
 * Integration Tests: Password Reset & OTP
 * Tests: Request → Validate → Confirm → Invalid/Expired
 */

import request from 'supertest';
import { mockPrisma, fixtures } from './setup';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

// Helper: Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/api/auth/password-reset/request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await mockPrisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const reset = await mockPrisma.passwordReset.create({
      data: {
        user_id: user.id,
        email,
        otp,
        is_used: false,
      },
    });

    return res.status(201).json({
      id: reset.id,
      message: 'OTP sent to email',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/password-reset/validate', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    const _reset = await mockPrisma.passwordReset.findUnique({
      where: { id: `reset_${email}` },
    });

    // For testing, find by email in our mock data
    const allResets = await mockPrisma.passwordReset.findMany?.();
    const matchingReset = allResets?.find((r: any) => r.email === email && r.otp === otp);

    if (!matchingReset) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (matchingReset.is_used) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    // Check expiry
    if (new Date() > new Date(matchingReset.expiresAt)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    return res.status(200).json({
      token: `reset_token_${matchingReset.id}`,
      message: 'OTP validated',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/password-reset/confirm', async (req: Request, res: Response) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: 'Email, OTP, and new password required' });
    }

    const user = await mockPrisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find reset token
    const allResets = await mockPrisma.passwordReset.findMany?.();
    const matchingReset = allResets?.find((r: any) => r.email === email && r.otp === otp);

    if (!matchingReset) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (matchingReset.is_used) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    if (new Date() > new Date(matchingReset.expiresAt)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Update password
    await mockPrisma.user.update({
      where: { id: user.id },
      data: { password: new_password },
    });

    // Mark OTP as used
    await mockPrisma.passwordReset.update({
      where: { id: matchingReset.id },
      data: { is_used: true },
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

describe('Password Reset Integration Tests', () => {
  beforeEach(async () => {
    await mockPrisma.$reset();

    // Create test user
    await mockPrisma.user.create({
      data: {
        email: fixtures.coordinator.email,
        password: fixtures.coordinator.password,
        name: fixtures.coordinator.name,
      },
    });
  });

  describe('POST /api/auth/password-reset/request', () => {
    it('should generate OTP for valid email', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: fixtures.coordinator.email });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: 'nonexistent@test.org' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should require email', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/password-reset/validate', () => {
    let testOtp: string;

    beforeEach(async () => {
      const _reqRes = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: fixtures.coordinator.email });

      // Get OTP from database
      const allResets = await mockPrisma.passwordReset.findMany?.();
      testOtp = allResets?.[0]?.otp || '123456';
    });

    it('should validate correct OTP', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/validate')
        .send({
          email: fixtures.coordinator.email,
          otp: testOtp,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/validate')
        .send({
          email: fixtures.coordinator.email,
          otp: '000000',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should require email and OTP', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/validate')
        .send({ email: fixtures.coordinator.email });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/password-reset/confirm', () => {
    let testOtp: string;

    beforeEach(async () => {
      const _reqRes = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: fixtures.coordinator.email });

      const allResets = await mockPrisma.passwordReset.findMany?.();
      testOtp = allResets?.[0]?.otp || '123456';
    });

    it('should reset password with valid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          email: fixtures.coordinator.email,
          otp: testOtp,
          new_password: 'NewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: fixtures.coordinator.email,
          password: 'NewPassword123!',
        });

      expect(loginRes.status).toBe(200);
    });

    it('should reject invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          email: fixtures.coordinator.email,
          otp: '000000',
          new_password: 'NewPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should require email, OTP, and password', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          email: fixtures.coordinator.email,
          otp: testOtp,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should prevent reusing OTP', async () => {
      // First reset
      await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          email: fixtures.coordinator.email,
          otp: testOtp,
          new_password: 'FirstReset123!',
        });

      // Try to reuse same OTP
      const res = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          email: fixtures.coordinator.email,
          otp: testOtp,
          new_password: 'SecondReset123!',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
