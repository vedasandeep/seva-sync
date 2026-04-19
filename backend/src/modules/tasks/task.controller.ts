import { Request, Response } from 'express';
import taskService from './task.service';

export class TaskController {
  /**
   * POST /api/tasks
   * Create new task
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const task = await taskService.createTask({
        ...req.body,
        createdBy: req.user.userId,
      });

      res.status(201).json({
        message: 'Task created successfully',
        task,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Create Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/tasks
   * List all tasks with filters
   */
  async listTasks(req: Request, res: Response): Promise<void> {
    try {
      const result = await taskService.listTasks(req.query as any);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/tasks/:id
   * Get task by ID
   */
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.json({ task });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: 'Not Found', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update task
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      res.json({
        message: 'Task updated successfully',
        task,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/tasks/:id/assign
   * Assign task to volunteer
   */
  async assignTask(req: Request, res: Response): Promise<void> {
    try {
      const { volunteerId } = req.body;
      const task = await taskService.assignTask(req.params.id, volunteerId);
      res.json({
        message: 'Task assigned successfully',
        task,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Assignment Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/tasks/:id/start
   * Start working on task
   */
  async startTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const task = await taskService.startTask(req.params.id, req.user.userId);
      res.json({
        message: 'Task started successfully',
        task,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Operation Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/tasks/:id/complete
   * Complete task and log hours
   */
  async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await taskService.completeTask(req.params.id, req.body);
      res.json({
        message: 'Task completed successfully',
        task: result.task,
        taskLog: result.taskLog,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Completion Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/tasks/:id/unassign
   * Unassign task (return to OPEN)
   */
  async unassignTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await taskService.unassignTask(req.params.id);
      res.json({
        message: 'Task unassigned successfully',
        task,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Operation Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/tasks/:id/cancel
   * Cancel task
   */
  async cancelTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await taskService.cancelTask(req.params.id);
      res.json({
        message: 'Task cancelled successfully',
        task,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Operation Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/tasks/nearby
   * Find tasks near a location
   */
  async findNearbyTasks(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng, radius, status, urgency } = req.query as any;
      const tasks = await taskService.findNearbyTasks(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseInt(radius, 10) : 10,
        { status, urgency }
      );
      res.json({ tasks, count: tasks.length });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/tasks/disaster/:disasterId/stats
   * Get task statistics for a disaster
   */
  async getDisasterTaskStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await taskService.getDisasterTaskStats(req.params.disasterId);
      res.json({ stats });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

export default new TaskController();
