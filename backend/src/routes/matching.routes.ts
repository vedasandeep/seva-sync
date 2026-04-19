import { Router } from 'express';
import { z } from 'zod';
import {
  getMatchesForTask,
  getMatchesForVolunteer,
  autoAssignTask,
  getBurnoutRisks,
  calculateScore,
} from '../controllers/matching.controller';
import { authenticate } from '../middleware/auth';
import { requireCoordinator } from '../middleware/rbac';
import { validateParams, validateQuery, validateBody } from '../middleware/validation';

const router = Router();

// Schema for limit query param
const limitQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional().transform(v => v ? parseInt(v) : undefined),
});

// Schema for UUID param
const uuidParamSchema = z.object({
  taskId: z.string().uuid(),
});

const volunteerUuidParamSchema = z.object({
  volunteerId: z.string().uuid(),
});

// Schema for score calculation
const calculateScoreSchema = z.object({
  volunteerId: z.string().uuid(),
  taskId: z.string().uuid(),
});

/**
 * GET /api/matching/task/:taskId
 * Get best volunteer matches for a task
 * Coordinator only
 */
router.get(
  '/task/:taskId',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  validateQuery(limitQuerySchema),
  getMatchesForTask
);

/**
 * GET /api/matching/volunteer/:volunteerId
 * Get best task matches for a volunteer
 * Coordinator only (or self if volunteer)
 */
router.get(
  '/volunteer/:volunteerId',
  authenticate,
  validateParams(volunteerUuidParamSchema),
  validateQuery(limitQuerySchema),
  getMatchesForVolunteer
);

/**
 * POST /api/matching/task/:taskId/auto-assign
 * Auto-assign best volunteer to a task
 * Coordinator only
 */
router.post(
  '/task/:taskId/auto-assign',
  authenticate,
  requireCoordinator,
  validateParams(uuidParamSchema),
  autoAssignTask
);

/**
 * GET /api/matching/burnout-risks
 * Get volunteers at risk of burnout
 * Coordinator only
 */
router.get(
  '/burnout-risks',
  authenticate,
  requireCoordinator,
  getBurnoutRisks
);

/**
 * POST /api/matching/score
 * Calculate match score for a specific volunteer-task pair
 * Coordinator only
 */
router.post(
  '/score',
  authenticate,
  requireCoordinator,
  validateBody(calculateScoreSchema),
  calculateScore
);

export default router;
