import { Router } from 'express';
import { z } from 'zod';
import taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { requireCoordinator } from '../middleware/rbac';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  completeTaskSchema,
  taskFiltersSchema,
  nearbyTasksSchema,
  bulkUpdateTaskSchema,
} from '../types/task.schemas';
import { uuidParamSchema } from '../types/volunteer.schemas';

const router = Router();

// Specific routes BEFORE generic :id routes
// Find nearby tasks
router.get(
  '/nearby',
  authenticate,
  validateQuery(nearbyTasksSchema),
  (req, res) => taskController.findNearbyTasks(req, res)
);

// Get disaster task stats
router.get(
  '/disaster/:disasterId/stats',
  authenticate,
  validateParams(z.object({ disasterId: z.string().uuid() })),
  (req, res) => taskController.getDisasterTaskStats(req, res)
);

// List tasks (volunteers can see all tasks)
router.get(
  '/',
  authenticate,
  validateQuery(taskFiltersSchema),
  (req, res) => taskController.listTasks(req, res)
);

// Generic :id routes
// Get task by ID (enhanced with type and logs)
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  (req, res) => taskController.getTaskById(req, res)
);

// Get task activity/timeline
router.get(
  '/:id/activity',
  authenticate,
  validateParams(uuidParamSchema),
  (req, res) => taskController.getTaskActivity(req, res)
);

// Get volunteer suggestions for a task
router.get(
  '/:id/suggestions',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  (req, res) => taskController.getVolunteerSuggestions(req, res)
);

// Create task (coordinator only)
router.post(
  '/',
  authenticate,
  requireCoordinator,
  validateBody(createTaskSchema),
  (req, res) => taskController.createTask(req, res)
);

// Bulk update tasks (coordinator only)
router.post(
  '/bulk-update',
  authenticate,
  requireCoordinator,
  validateBody(bulkUpdateTaskSchema),
  (req, res) => taskController.bulkUpdateTasks(req, res)
);

// Update task (coordinator only)
router.put(
  '/:id',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  validateBody(updateTaskSchema),
  (req, res) => taskController.updateTask(req, res)
);

// Assign task (coordinator only)
router.post(
  '/:id/assign',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  validateBody(assignTaskSchema),
  (req, res) => taskController.assignTask(req, res)
);

// Start task (volunteer)
router.post(
  '/:id/start',
  authenticate,
  validateParams(uuidParamSchema),
  (req, res) => taskController.startTask(req, res)
);

// Complete task (volunteer)
router.post(
  '/:id/complete',
  authenticate,
  validateParams(uuidParamSchema),
  validateBody(completeTaskSchema),
  (req, res) => taskController.completeTask(req, res)
);

// Unassign task (coordinator only)
router.post(
  '/:id/unassign',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  (req, res) => taskController.unassignTask(req, res)
);

// Cancel task (coordinator only)
router.post(
  '/:id/cancel',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  (req, res) => taskController.cancelTask(req, res)
);

export default router;
