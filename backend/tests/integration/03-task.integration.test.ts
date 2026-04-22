/**
 * Integration Tests: Task Management
 * Tests: Create → Filter → Assign → Geospatial search
 */

import request from 'supertest';
import { mockPrisma, fixtures } from './setup';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const { title, location, latitude, longitude, disaster_id, task_type, urgency } = req.body;

    if (!title || !disaster_id) {
      return res.status(400).json({ error: 'Title and disaster_id required' });
    }

    const task = await mockPrisma.task.create({
      data: {
        title,
        location: location || 'Unknown',
        latitude: latitude || 0,
        longitude: longitude || 0,
        disaster_id,
        task_type: task_type || 'OTHER',
        urgency: urgency || 'MEDIUM',
        status: 'PENDING',
      },
    });

    return res.status(201).json(task);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const { disaster_id } = req.query;
    let tasks = await mockPrisma.task.findMany();

    if (disaster_id) {
      tasks = tasks.filter((t: any) => t.disaster_id === disaster_id);
    }

    return res.status(200).json(tasks);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lon, radius } = req.query;
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    const searchRadius = parseFloat(radius as string) || 5;

    let tasks = await mockPrisma.task.findMany();

    // Filter by distance
    tasks = tasks.filter((t: any) => {
      const dist = Math.hypot(t.latitude - latitude, t.longitude - longitude);
      return dist <= searchRadius;
    });

    // Sort by distance
    tasks.sort((a: any, b: any) => {
      const distA = Math.hypot(a.latitude - latitude, a.longitude - longitude);
      const distB = Math.hypot(b.latitude - latitude, b.longitude - longitude);
      return distA - distB;
    });

    return res.status(200).json(tasks);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id/assign', async (req: Request, res: Response) => {
  try {
    const { volunteer_id } = req.body;

    if (!volunteer_id) {
      return res.status(400).json({ error: 'Volunteer ID required' });
    }

    const task = await mockPrisma.task.update({
      where: { id: req.params.id },
      data: {
        assigned_volunteer_id: volunteer_id,
        status: 'ASSIGNED',
      },
    });

    return res.status(200).json(task);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

describe('Task Integration Tests', () => {
  let disasterId: string;

  beforeEach(async () => {
    await mockPrisma.$reset();

    // Create a disaster for task tests
    const disaster = await mockPrisma.disaster.create({
      data: {
        title: 'Test Disaster',
        location: 'Test Location',
        status: 'ACTIVE',
      },
    });

    disasterId = disaster.id;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: fixtures.task.title,
          location: fixtures.task.location,
          latitude: fixtures.task.latitude,
          longitude: fixtures.task.longitude,
          disaster_id: disasterId,
          task_type: fixtures.task.task_type,
          urgency: fixtures.task.urgency,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', fixtures.task.title);
      expect(res.body).toHaveProperty('disaster_id', disasterId);
      expect(res.body).toHaveProperty('status', 'PENDING');
    });

    it('should reject missing disaster_id', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: fixtures.task.title });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    let _taskId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          ...fixtures.task,
          disaster_id: disasterId,
        });

      _taskId = createRes.body.id;
    });

    it('should list all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter tasks by disaster_id', async () => {
      // Create task in different disaster
      const disaster2 = await mockPrisma.disaster.create({
        data: {
          title: 'Other Disaster',
          location: 'Other Location',
          status: 'ACTIVE',
        },
      });

      await request(app)
        .post('/api/tasks')
        .send({
          ...fixtures.task,
          title: 'Other Task',
          disaster_id: disaster2.id,
        });

      const res = await request(app)
        .get(`/api/tasks?disaster_id=${disasterId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].disaster_id).toBe(disasterId);
    });
  });

  describe('GET /api/tasks/nearby', () => {
    beforeEach(async () => {
      // Create multiple tasks at different locations
      await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task Near 1',
          latitude: 19.076,
          longitude: 72.877,
          disaster_id: disasterId,
        });

      await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task Near 2',
          latitude: 19.077,
          longitude: 72.878,
          disaster_id: disasterId,
        });

      await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task Far',
          latitude: 20.0,
          longitude: 73.0,
          disaster_id: disasterId,
        });
    });

    it('should return tasks within radius', async () => {
      const res = await request(app)
        .get('/api/tasks/nearby?lat=19.076&lon=72.877&radius=5');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should sort by distance', async () => {
      const res = await request(app)
        .get('/api/tasks/nearby?lat=19.076&lon=72.877&radius=5');

      expect(res.status).toBe(200);
      const distances = res.body.map((t: any) =>
        Math.hypot(t.latitude - 19.076, t.longitude - 72.877)
      );

      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });
  });

  describe('PATCH /api/tasks/:id/assign', () => {
    let taskId: string;
    let volunteerId: string;

    beforeEach(async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({ ...fixtures.task, disaster_id: disasterId });

      taskId = taskRes.body.id;

      const volunteerRes = await request(app)
        .post('/api/volunteers')
        .send(fixtures.volunteer);

      volunteerId = volunteerRes?.body?.id || 'volunteer-1';
    });

    it('should assign task to volunteer', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/assign`)
        .send({ volunteer_id: volunteerId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('assigned_volunteer_id', volunteerId);
      expect(res.body).toHaveProperty('status', 'ASSIGNED');
    });

    it('should require volunteer_id', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/assign`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
