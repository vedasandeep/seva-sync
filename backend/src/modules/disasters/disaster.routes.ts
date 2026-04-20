import { Router } from 'express';
import * as disasterController from './disaster.controller';
import heatmapRouter from './heatmap.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireAdmin, requireCoordinator } from '../../shared/middleware/rbac';
import { validateBody, validateQuery, validateParams } from '../../shared/middleware/validation';
import {
  createDisasterSchema,
  updateDisasterSchema,
  listDisastersSchema,
  disasterIdSchema,
  activateDisasterSchema,
  resolveDisasterSchema,
} from '../../shared/types/disaster.schemas';

const router = Router();

/**
 * Mount heatmap subrouter at /disasters
 * This must be before /:id routes to avoid collision
 */
router.use(authenticate, heatmapRouter);

/**
 * @route   POST /api/disasters
 * @desc    Create a new disaster event
 * @access  DISASTER_ADMIN, SUPER_ADMIN
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createDisasterSchema),
  disasterController.createDisaster
);

/**
 * @route   GET /api/disasters/active
 * @desc    Get all active disasters (for dashboard)
 * @access  All authenticated users
 * @note    This route MUST come before /:id to avoid route collision
 */
router.get(
  '/active',
  authenticate,
  disasterController.getActiveDisasters
);

/**
 * @route   GET /api/disasters
 * @desc    List disasters with filters and pagination
 * @access  All authenticated users
 */
router.get(
  '/',
  authenticate,
  validateQuery(listDisastersSchema),
  (req, res, next) => disasterController.listDisasters(req, res, next)
);

/**
 * @route   GET /api/disasters/:id
 * @desc    Get a single disaster by ID with full details
 * @access  All authenticated users
 */
router.get(
  '/:id',
  authenticate,
  validateParams(disasterIdSchema),
  disasterController.getDisasterById
);

/**
 * @route   PATCH /api/disasters/:id
 * @desc    Update a disaster
 * @access  DISASTER_ADMIN, SUPER_ADMIN
 */
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(disasterIdSchema),
  validateBody(updateDisasterSchema),
  disasterController.updateDisaster
);

/**
 * @route   POST /api/disasters/:id/activate
 * @desc    Activate a disaster (set status to ACTIVE)
 * @access  DISASTER_ADMIN, SUPER_ADMIN
 */
router.post(
  '/:id/activate',
  authenticate,
  requireAdmin,
  validateParams(disasterIdSchema),
  validateBody(activateDisasterSchema),
  disasterController.activateDisaster
);

/**
 * @route   POST /api/disasters/:id/resolve
 * @desc    Resolve a disaster (set status to RESOLVED)
 * @access  DISASTER_ADMIN, SUPER_ADMIN
 */
router.post(
  '/:id/resolve',
  authenticate,
  requireAdmin,
  validateParams(disasterIdSchema),
  validateBody(resolveDisasterSchema),
  disasterController.resolveDisaster
);

/**
 * @route   POST /api/disasters/:id/archive
 * @desc    Archive a disaster (set status to ARCHIVED)
 * @access  DISASTER_ADMIN, SUPER_ADMIN
 */
router.post(
  '/:id/archive',
  authenticate,
  requireAdmin,
  validateParams(disasterIdSchema),
  disasterController.archiveDisaster
);

/**
 * @route   GET /api/disasters/:id/stats
 * @desc    Get comprehensive statistics for a disaster
 * @access  NGO_COORDINATOR, DISASTER_ADMIN, SUPER_ADMIN
 */
router.get(
  '/:id/stats',
  authenticate,
  requireCoordinator,
  validateParams(disasterIdSchema),
  disasterController.getDisasterStats
);

export default router;
