/**
 * Integration Tests: Volunteer Management
 * Tests: Nearby search → Location update → Wellness → Burnout filter
 */

import request from 'supertest';
import { mockPrisma, fixtures } from './setup';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/volunteers', async (req: Request, res: Response) => {
  try {
    const { phone, name, latitude, longitude, skills, burnout_score } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone required' });
    }

    const volunteer = await mockPrisma.volunteer.create({
      data: {
        phone,
        name: name || 'Volunteer',
        latitude: latitude || 0,
        longitude: longitude || 0,
        skills: skills || [],
        burnout_score: burnout_score || 0,
        status: 'ACTIVE',
      },
    });

    return res.status(201).json(volunteer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/volunteers/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lon, radius } = req.query;
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    const searchRadius = parseFloat(radius as string) || 10;

    let volunteers = await mockPrisma.volunteer.findMany();

    volunteers = volunteers.filter((v: any) => {
      const dist = Math.hypot(v.latitude - latitude, v.longitude - longitude);
      return dist <= searchRadius;
    });

    volunteers.sort((a: any, b: any) => {
      const distA = Math.hypot(a.latitude - latitude, a.longitude - longitude);
      const distB = Math.hypot(b.latitude - latitude, b.longitude - longitude);
      return distA - distB;
    });

    return res.status(200).json(volunteers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/volunteers/:id', async (req: Request, res: Response) => {
  try {
    const volunteer = await mockPrisma.volunteer.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.status(200).json(volunteer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/volunteers/:id/check-in', async (req: Request, res: Response) => {
  try {
    const { wellness_score } = req.body;

    if (!wellness_score) {
      return res.status(400).json({ error: 'Wellness score required' });
    }

    const volunteer = await mockPrisma.volunteer.findUnique({
      where: { id: req.params.id },
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Simulate burnout decrease with wellness check-in
    const scoreFactor = wellness_score === 'high' ? 0.1 : wellness_score === 'medium' ? 0.05 : 0.02;
    const newBurnout = Math.max(0, volunteer.burnout_score - scoreFactor);

    const updated = await mockPrisma.volunteer.update({
      where: { id: req.params.id },
      data: { burnout_score: newBurnout },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/volunteers', async (req: Request, res: Response) => {
  try {
    const { burnout } = req.query;
    let volunteers = await mockPrisma.volunteer.findMany();

    if (burnout === 'high') {
      volunteers = volunteers.filter((v: any) => v.burnout_score >= 0.7);
    } else if (burnout === 'medium') {
      volunteers = volunteers.filter((v: any) => v.burnout_score >= 0.3 && v.burnout_score < 0.7);
    } else if (burnout === 'low') {
      volunteers = volunteers.filter((v: any) => v.burnout_score < 0.3);
    }

    return res.status(200).json(volunteers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

describe('Volunteer Integration Tests', () => {
  beforeEach(async () => {
    await mockPrisma.$reset();
  });

  describe('POST /api/volunteers', () => {
    it('should create a new volunteer', async () => {
      const res = await request(app)
        .post('/api/volunteers')
        .send({
          phone: fixtures.volunteer.phone,
          name: fixtures.volunteer.name,
          latitude: fixtures.volunteer.latitude,
          longitude: fixtures.volunteer.longitude,
          skills: fixtures.volunteer.skills,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('phone', fixtures.volunteer.phone);
      expect(res.body).toHaveProperty('status', 'ACTIVE');
    });

    it('should reject missing phone', async () => {
      const res = await request(app)
        .post('/api/volunteers')
        .send({ name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/volunteers/nearby', () => {
    beforeEach(async () => {
      await request(app).post('/api/volunteers').send({
        phone: '+919000000001',
        latitude: 19.076,
        longitude: 72.877,
      });

      await request(app).post('/api/volunteers').send({
        phone: '+919000000002',
        latitude: 19.077,
        longitude: 72.878,
      });

      await request(app).post('/api/volunteers').send({
        phone: '+919000000003',
        latitude: 20.0,
        longitude: 73.0,
      });
    });

    it('should return nearby volunteers', async () => {
      const res = await request(app)
        .get('/api/volunteers/nearby?lat=19.076&lon=72.877&radius=10');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should sort by distance', async () => {
      const res = await request(app)
        .get('/api/volunteers/nearby?lat=19.076&lon=72.877');

      const distances = res.body.map((v: any) =>
        Math.hypot(v.latitude - 19.076, v.longitude - 72.877)
      );

      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });
  });

  describe('PATCH /api/volunteers/:id', () => {
    let volunteerId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/volunteers')
        .send(fixtures.volunteer);

      volunteerId = res.body.id;
    });

    it('should update volunteer location', async () => {
      const res = await request(app)
        .patch(`/api/volunteers/${volunteerId}`)
        .send({ latitude: 20.0, longitude: 73.0 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('latitude', 20.0);
      expect(res.body).toHaveProperty('longitude', 73.0);
    });
  });

  describe('POST /api/volunteers/:id/check-in', () => {
    let volunteerId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/volunteers')
        .send({ ...fixtures.volunteer, burnout_score: 0.8 });

      volunteerId = res.body.id;
    });

    it('should record wellness check-in and decrease burnout', async () => {
      const res = await request(app)
        .post(`/api/volunteers/${volunteerId}/check-in`)
        .send({ wellness_score: 'high' });

      expect(res.status).toBe(200);
      expect(res.body.burnout_score).toBeLessThan(0.8);
    });

    it('should require wellness_score', async () => {
      const res = await request(app)
        .post(`/api/volunteers/${volunteerId}/check-in`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/volunteers?burnout=X', () => {
    beforeEach(async () => {
      await request(app).post('/api/volunteers').send({
        phone: '+919000000001',
        burnout_score: 0.2,
      });

      await request(app).post('/api/volunteers').send({
        phone: '+919000000002',
        burnout_score: 0.5,
      });

      await request(app).post('/api/volunteers').send({
        phone: '+919000000003',
        burnout_score: 0.8,
      });
    });

    it('should filter high burnout volunteers', async () => {
      const res = await request(app)
        .get('/api/volunteers?burnout=high');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].burnout_score).toBeGreaterThanOrEqual(0.7);
    });

    it('should filter medium burnout volunteers', async () => {
      const res = await request(app)
        .get('/api/volunteers?burnout=medium');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].burnout_score).toBeGreaterThanOrEqual(0.3);
    });

    it('should filter low burnout volunteers', async () => {
      const res = await request(app)
        .get('/api/volunteers?burnout=low');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].burnout_score).toBeLessThan(0.3);
    });
  });
});
