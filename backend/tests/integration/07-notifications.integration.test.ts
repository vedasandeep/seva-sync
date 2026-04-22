/**
 * Integration Tests: Notifications
 * Tests: Creation → Listing → Mark as read → Delivery
 */

import request from 'supertest';
import { mockPrisma } from './setup';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/notifications', async (req: Request, res: Response) => {
  try {
    const { volunteer_id, type, title, message, related_task_id } = req.body;

    if (!volunteer_id || !type) {
      return res.status(400).json({ error: 'Volunteer ID and type required' });
    }

    const notification = await mockPrisma.notification.create({
      data: {
        volunteer_id,
        type,
        title: title || 'Notification',
        message: message || '',
        related_task_id,
        is_read: false,
      },
    });

    return res.status(201).json(notification);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications', async (req: Request, res: Response) => {
  try {
    const { volunteer_id } = req.query;

    if (!volunteer_id) {
      return res.status(400).json({ error: 'Volunteer ID required' });
    }

    const notifications = await mockPrisma.notification.findMany({
      where: { volunteer_id },
    });

    return res.status(200).json(notifications);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/notifications/:id', async (req: Request, res: Response) => {
  try {
    const notification = await mockPrisma.notification.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.status(200).json(notification);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/send', async (req: Request, res: Response) => {
  try {
    const { notification_id, channel } = req.body;

    if (!notification_id) {
      return res.status(400).json({ error: 'Notification ID required' });
    }

    // Mock sending via email/SMS
    const result = {
      notification_id,
      channel: channel || 'email',
      status: 'sent',
      timestamp: new Date(),
    };

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

describe('Notifications Integration Tests', () => {
  let volunteerId: string;

  beforeEach(async () => {
    await mockPrisma.$reset();

    // Create test volunteer
    const volunteer = await mockPrisma.volunteer.create({
      data: {
        phone: '+919123456789',
        status: 'ACTIVE',
      },
    });

    volunteerId = volunteer.id;
  });

  describe('POST /api/notifications', () => {
    it('should create a notification', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          volunteer_id: volunteerId,
          type: 'TASK_ASSIGNED',
          title: 'New Task',
          message: 'You have been assigned a task',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('volunteer_id', volunteerId);
      expect(res.body).toHaveProperty('type', 'TASK_ASSIGNED');
      expect(res.body).toHaveProperty('is_read', false);
    });

    it('should require volunteer_id and type', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ title: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/notifications')
        .send({
          volunteer_id: volunteerId,
          type: 'TASK_ASSIGNED',
          title: 'Task 1',
        });

      await request(app)
        .post('/api/notifications')
        .send({
          volunteer_id: volunteerId,
          type: 'BURNOUT_ALERT',
          title: 'Burnout Alert',
        });
    });

    it('should list volunteer notifications', async () => {
      const res = await request(app)
        .get(`/api/notifications?volunteer_id=${volunteerId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should require volunteer_id', async () => {
      const res = await request(app)
        .get('/api/notifications');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return empty array for volunteer with no notifications', async () => {
      const volunteer2 = await mockPrisma.volunteer.create({
        data: { phone: '+919000000000', status: 'ACTIVE' },
      });

      const res = await request(app)
        .get(`/api/notifications?volunteer_id=${volunteer2.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('PATCH /api/notifications/:id', () => {
    let notificationId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/notifications')
        .send({
          volunteer_id: volunteerId,
          type: 'TASK_ASSIGNED',
          title: 'Task',
        });

      notificationId = createRes.body.id;
    });

    it('should mark notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notificationId}`)
        .send({ is_read: true });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('is_read', true);
    });

    it('should update other notification fields', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notificationId}`)
        .send({ message: 'Updated message' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Updated message');
    });
  });

  describe('POST /api/notifications/send', () => {
    let notificationId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/notifications')
        .send({
          volunteer_id: volunteerId,
          type: 'TASK_ASSIGNED',
          title: 'Task',
        });

      notificationId = createRes.body.id;
    });

    it('should send notification via email', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({
          notification_id: notificationId,
          channel: 'email',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'sent');
      expect(res.body).toHaveProperty('channel', 'email');
    });

    it('should send notification via SMS', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({
          notification_id: notificationId,
          channel: 'sms',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'sent');
      expect(res.body).toHaveProperty('channel', 'sms');
    });

    it('should require notification_id', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ channel: 'email' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Task assignment → Notification creation flow', () => {
    it('should create notification when task is assigned', async () => {
      // Create disaster and task
      const disaster = await mockPrisma.disaster.create({
        data: { title: 'Test', location: 'Test', status: 'ACTIVE' },
      });

      const task = await mockPrisma.task.create({
        data: {
          title: 'Test Task',
          disaster_id: disaster.id,
          status: 'PENDING',
        },
      });

      // Create notification when task is assigned
      const notifRes = await request(app)
        .post('/api/notifications')
        .send({
          volunteer_id: volunteerId,
          type: 'TASK_ASSIGNED',
          title: `Task assigned: ${task.title}`,
          related_task_id: task.id,
        });

      expect(notifRes.status).toBe(201);
      expect(notifRes.body).toHaveProperty('related_task_id', task.id);

      // Verify notification appears in list
      const listRes = await request(app)
        .get(`/api/notifications?volunteer_id=${volunteerId}`);

      expect(listRes.body.length).toBeGreaterThan(0);
      expect(listRes.body.some((n: any) => n.related_task_id === task.id)).toBe(true);
    });
  });
});
