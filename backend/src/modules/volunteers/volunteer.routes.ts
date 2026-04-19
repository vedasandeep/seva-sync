import { Router } from 'express';
import volunteerController from './volunteer.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole, requireCoordinator, requireOwnershipOrAdmin } from '../../shared/middleware/rbac';
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validation';
import {
  updateVolunteerSchema,
  updateLocationSchema,
  wellnessCheckinSchema,
  volunteerFiltersSchema,
  nearbyVolunteersSchema,
  uuidParamSchema,
} from '../../shared/types/volunteer.schemas';
import { UserRole } from '@prisma/client';

const router = Router();

// Public/coordinator routes
router.get(
  '/',
  authenticate,
  requireCoordinator,
  validateQuery(volunteerFiltersSchema),
  (req, res) => volunteerController.listVolunteers(req, res)
);

router.get(
  '/nearby',
  authenticate,
  requireCoordinator,
  validateQuery(nearbyVolunteersSchema),
  (req, res) => volunteerController.findNearbyVolunteers(req, res)
);

router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  (req, res) => volunteerController.getVolunteerById(req, res)
);

// Volunteer self-service routes
router.put(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  validateBody(updateVolunteerSchema),
  requireOwnershipOrAdmin((req) => req.params.id),
  (req, res) => volunteerController.updateVolunteer(req, res)
);

router.post(
  '/:id/location',
  authenticate,
  validateParams(uuidParamSchema),
  validateBody(updateLocationSchema),
  requireOwnershipOrAdmin((req) => req.params.id),
  (req, res) => volunteerController.updateLocation(req, res)
);

router.post(
  '/:id/checkin',
  authenticate,
  validateParams(uuidParamSchema),
  validateBody(wellnessCheckinSchema),
  requireOwnershipOrAdmin((req) => req.params.id),
  (req, res) => volunteerController.submitWellnessCheckin(req, res)
);

router.get(
  '/:id/wellness',
  authenticate,
  validateParams(uuidParamSchema),
  requireOwnershipOrAdmin((req) => req.params.id),
  (req, res) => volunteerController.getWellnessHistory(req, res)
);

router.get(
  '/:id/tasks',
  authenticate,
  validateParams(uuidParamSchema),
  requireOwnershipOrAdmin((req) => req.params.id),
  (req, res) => volunteerController.getTaskHistory(req, res)
);

router.get(
  '/:id/stats',
  authenticate,
  validateParams(uuidParamSchema),
  (req, res) => volunteerController.getVolunteerStats(req, res)
);

// Admin-only routes
router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.DISASTER_ADMIN, UserRole.SUPER_ADMIN),
  validateParams(uuidParamSchema),
  (req, res) => volunteerController.deactivateVolunteer(req, res)
);

router.post(
  '/:id/reactivate',
  authenticate,
  requireRole(UserRole.DISASTER_ADMIN, UserRole.SUPER_ADMIN),
  validateParams(uuidParamSchema),
  (req, res) => volunteerController.reactivateVolunteer(req, res)
);

export default router;
