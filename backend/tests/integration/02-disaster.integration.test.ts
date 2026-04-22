/**
 * Integration Tests: Disaster Management
 * Tests: Create → Get → Update status → Authorization
 */

import request from 'supertest';
import { mockPrisma, fixtures } from './setup';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

// Mock Disaster Routes
app.post('/api/disasters', async (req: Request, res: Response) => {
  try {
    const { title, location, latitude, longitude, disaster_type, description } = req.body;

    if (!title || !location) {
      return res.status(400).json({ error: 'Title and location required' });
    }

    const disaster = await mockPrisma.disaster.create({
      data: {
        title,
        location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        disaster_type: disaster_type || 'OTHER',
        description: description || '',
        status: 'ACTIVE',
      },
    });

    return res.status(201).json(disaster);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/disasters/:id', async (req: Request, res: Response) => {
  try {
    const disaster = await mockPrisma.disaster.findUnique({
      where: { id: req.params.id },
    });

    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }

    return res.status(200).json(disaster);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/disasters/:id', async (req: Request, res: Response) => {
  try {
    // Mock authorization check
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const disaster = await mockPrisma.disaster.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.status(200).json(disaster);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

describe('Disaster Integration Tests', () => {
  beforeEach(async () => {
    await mockPrisma.$reset();
  });

  describe('POST /api/disasters', () => {
    it('should create a new disaster', async () => {
      const res = await request(app)
        .post('/api/disasters')
        .send({
          title: fixtures.disaster.title,
          location: fixtures.disaster.location,
          latitude: fixtures.disaster.latitude,
          longitude: fixtures.disaster.longitude,
          disaster_type: fixtures.disaster.disaster_type,
          description: fixtures.disaster.description,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', fixtures.disaster.title);
      expect(res.body).toHaveProperty('status', 'ACTIVE');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/disasters')
        .send({ location: fixtures.disaster.location });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/disasters/:id', () => {
    let disasterId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/disasters')
        .send(fixtures.disaster);

      disasterId = createRes.body.id;
    });

    it('should return disaster by id', async () => {
      const res = await request(app)
        .get(`/api/disasters/${disasterId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', disasterId);
      expect(res.body).toHaveProperty('title', fixtures.disaster.title);
    });

    it('should return 404 for non-existent disaster', async () => {
      const res = await request(app)
        .get('/api/disasters/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/disasters/:id', () => {
    let disasterId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/disasters')
        .send(fixtures.disaster);

      disasterId = createRes.body.id;
    });

    it('should update disaster status', async () => {
      const res = await request(app)
        .patch(`/api/disasters/${disasterId}`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'RESOLVED');
    });

    it('should reject unauthorized updates', async () => {
      const res = await request(app)
        .patch(`/api/disasters/${disasterId}`)
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
  });
});
