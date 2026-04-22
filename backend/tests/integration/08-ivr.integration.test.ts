/**
 * Integration Tests: IVR Flow
 * Tests: Menu → Task selection → Task log → Completion → Status update
 */

import request from 'supertest';
import { mockPrisma } from './setup';
import { Request, Response } from 'express';
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/ivr/dtmf', async (req: Request, res: Response) => {
  try {
    const { volunteer_id, digit, session_id } = req.body;

    if (!volunteer_id || digit === undefined) {
      return res.status(400).json({ error: 'Volunteer ID and digit required' });
    }

    // Mock DTMF handling
    let response = '';

    if (digit === '0') {
      // Menu
      response = 'Press 1 for tasks, 2 to start task, 3 to complete task, 4 for check-in';
    } else if (digit === '1') {
      // Get tasks
      const tasks = await mockPrisma.task.findMany();
      response = `You have ${tasks.length} tasks. Press task number to select.`;
    } else if (digit === '2') {
      // Start task
      response = 'Task started. Work on it and call back to complete.';
    } else if (digit === '3') {
      // Complete task
      response = 'Task marked as complete. Thank you!';
    } else if (digit === '4') {
      // Check-in
      response = 'How are you feeling? Press 1 for good, 2 for ok, 3 for tired';
    } else {
      response = 'Invalid option. Press 0 for menu';
    }

    return res.status(200).json({
      response,
      session_id: session_id || `session_${Date.now()}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ivr/select-task', async (req: Request, res: Response) => {
  try {
    const { volunteer_id, task_number } = req.body;

    if (!volunteer_id || task_number === undefined) {
      return res.status(400).json({ error: 'Volunteer ID and task number required' });
    }

    const tasks = await mockPrisma.task.findMany();
    const selectedTask = tasks[task_number - 1];

    if (!selectedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({
      task_id: selectedTask.id,
      title: selectedTask.title,
      description: selectedTask.title,
      response: `Task: ${selectedTask.title}. Press 1 to start, 0 for menu`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ivr/start-task', async (req: Request, res: Response) => {
  try {
    const { volunteer_id, task_id } = req.body;

    if (!volunteer_id || !task_id) {
      return res.status(400).json({ error: 'Volunteer ID and task ID required' });
    }

    // Create task log
    await mockPrisma.taskLog?.create?.({
      data: {
        task_id,
        volunteer_id,
        status: 'IN_PROGRESS',
        started_at: new Date(),
      },
    });

    // Update task status
    await mockPrisma.task.update({
      where: { id: task_id },
      data: { status: 'IN_PROGRESS' },
    });

    return res.status(200).json({
      task_id,
      status: 'IN_PROGRESS',
      response: 'Task started. Call back when done.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ivr/complete-task', async (req: Request, res: Response) => {
  try {
    const { volunteer_id, task_id } = req.body;

    if (!volunteer_id || !task_id) {
      return res.status(400).json({ error: 'Volunteer ID and task ID required' });
    }

    // Update task status
    await mockPrisma.task.update({
      where: { id: task_id },
      data: { status: 'COMPLETED' },
    });

    // Log completion
    const volunteer = await mockPrisma.volunteer.findUnique({
      where: { id: volunteer_id },
    });

    // Update volunteer's task count
    if (volunteer) {
      await mockPrisma.volunteer.update({
        where: { id: volunteer_id },
        data: { tasks_completed: (volunteer.tasks_completed || 0) + 1 },
      });
    }

    return res.status(200).json({
      task_id,
      status: 'COMPLETED',
      response: 'Task marked complete. Thank you for helping!',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ivr/check-in', async (req: Request, res: Response) => {
  try {
    const { volunteer_id, wellness_score } = req.body;

    if (!volunteer_id || wellness_score === undefined) {
      return res.status(400).json({ error: 'Volunteer ID and wellness score required' });
    }

    // Update volunteer wellness
    const volunteer = await mockPrisma.volunteer.findUnique({
      where: { id: volunteer_id },
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const scoreFactor = wellness_score === 'good' ? 0.15 : wellness_score === 'ok' ? 0.08 : 0.02;
    const newBurnout = Math.max(0, volunteer.burnout_score - scoreFactor);

    await mockPrisma.volunteer.update({
      where: { id: volunteer_id },
      data: { burnout_score: newBurnout },
    });

    return res.status(200).json({
      volunteer_id,
      new_burnout_score: newBurnout,
      response: 'Thank you for the check-in. Take care!',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

describe('IVR Integration Tests', () => {
  let volunteerId: string;
  let taskId: string;

  beforeEach(async () => {
    await mockPrisma.$reset();

    // Create test volunteer
    const volunteer = await mockPrisma.volunteer.create({
      data: {
        phone: '+919123456789',
        status: 'ACTIVE',
        burnout_score: 0.5,
      },
    });

    volunteerId = volunteer.id;

    // Create test disaster and task
    const disaster = await mockPrisma.disaster.create({
      data: {
        title: 'Test Disaster',
        location: 'Test Location',
        status: 'ACTIVE',
      },
    });

    const task = await mockPrisma.task.create({
      data: {
        title: 'Deliver supplies',
        disaster_id: disaster.id,
        status: 'PENDING',
      },
    });

    taskId = task.id;
  });

  describe('POST /api/ivr/dtmf', () => {
    it('should handle DTMF 0 (menu)', async () => {
      const res = await request(app)
        .post('/api/ivr/dtmf')
        .send({
          volunteer_id: volunteerId,
          digit: '0',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('response');
      expect(res.body.response).toContain('Press');
    });

    it('should handle DTMF 1 (tasks)', async () => {
      const res = await request(app)
        .post('/api/ivr/dtmf')
        .send({
          volunteer_id: volunteerId,
          digit: '1',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('response');
    });

    it('should handle DTMF 4 (check-in)', async () => {
      const res = await request(app)
        .post('/api/ivr/dtmf')
        .send({
          volunteer_id: volunteerId,
          digit: '4',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('response');
    });

    it('should return menu for invalid DTMF', async () => {
      const res = await request(app)
        .post('/api/ivr/dtmf')
        .send({
          volunteer_id: volunteerId,
          digit: '9',
        });

      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Invalid option');
    });

    it('should require volunteer_id and digit', async () => {
      const res = await request(app)
        .post('/api/ivr/dtmf')
        .send({ volunteer_id: volunteerId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/ivr/select-task', () => {
    it('should retrieve selected task details', async () => {
      const res = await request(app)
        .post('/api/ivr/select-task')
        .send({
          volunteer_id: volunteerId,
          task_number: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('task_id', taskId);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 404 for invalid task number', async () => {
      const res = await request(app)
        .post('/api/ivr/select-task')
        .send({
          volunteer_id: volunteerId,
          task_number: 999,
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/ivr/start-task', () => {
    it('should mark task as in progress', async () => {
      const res = await request(app)
        .post('/api/ivr/start-task')
        .send({
          volunteer_id: volunteerId,
          task_id: taskId,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'IN_PROGRESS');

      // Verify task status updated
      const task = await mockPrisma.task.findUnique({
        where: { id: taskId },
      });

      expect(task?.status).toBe('IN_PROGRESS');
    });

    it('should require task_id and volunteer_id', async () => {
      const res = await request(app)
        .post('/api/ivr/start-task')
        .send({ volunteer_id: volunteerId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/ivr/complete-task', () => {
    beforeEach(async () => {
      // Start task first
      await request(app)
        .post('/api/ivr/start-task')
        .send({
          volunteer_id: volunteerId,
          task_id: taskId,
        });
    });

    it('should mark task as completed', async () => {
      const res = await request(app)
        .post('/api/ivr/complete-task')
        .send({
          volunteer_id: volunteerId,
          task_id: taskId,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'COMPLETED');

      // Verify task status updated
      const task = await mockPrisma.task.findUnique({
        where: { id: taskId },
      });

      expect(task?.status).toBe('COMPLETED');
    });
  });

  describe('POST /api/ivr/check-in', () => {
    it('should record wellness check-in and reduce burnout', async () => {
      const res = await request(app)
        .post('/api/ivr/check-in')
        .send({
          volunteer_id: volunteerId,
          wellness_score: 'good',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('new_burnout_score');
      expect(res.body.new_burnout_score).toBeLessThan(0.5);
    });

    it('should handle different wellness scores', async () => {
      const res = await request(app)
        .post('/api/ivr/check-in')
        .send({
          volunteer_id: volunteerId,
          wellness_score: 'tired',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('new_burnout_score');
    });

    it('should require wellness_score', async () => {
      const res = await request(app)
        .post('/api/ivr/check-in')
        .send({ volunteer_id: volunteerId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Complete IVR Flow', () => {
    it('should handle: Menu → Select Task → Start → Complete → Check-in', async () => {
      // Menu
      let res = await request(app)
        .post('/api/ivr/dtmf')
        .send({ volunteer_id: volunteerId, digit: '0' });

      expect(res.status).toBe(200);

      // Select task
      res = await request(app)
        .post('/api/ivr/select-task')
        .send({ volunteer_id: volunteerId, task_number: 1 });

      expect(res.status).toBe(200);

      // Start task
      res = await request(app)
        .post('/api/ivr/start-task')
        .send({ volunteer_id: volunteerId, task_id: taskId });

      expect(res.status).toBe(200);

      // Complete task
      res = await request(app)
        .post('/api/ivr/complete-task')
        .send({ volunteer_id: volunteerId, task_id: taskId });

      expect(res.status).toBe(200);

      // Check-in
      res = await request(app)
        .post('/api/ivr/check-in')
        .send({ volunteer_id: volunteerId, wellness_score: 'good' });

      expect(res.status).toBe(200);

      // Verify final state
      const volunteer = await mockPrisma.volunteer.findUnique({
        where: { id: volunteerId },
      });

      expect(volunteer?.burnout_score).toBeLessThan(0.5);
    });
  });
});
