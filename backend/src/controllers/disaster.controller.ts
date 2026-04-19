import { Request, Response, NextFunction } from 'express';
import * as disasterService from '../services/disaster.service';
import {
  CreateDisasterInput,
  UpdateDisasterInput,
  ListDisastersQuery,
} from '../types/disaster.schemas';

/**
 * Create a new disaster event
 * POST /api/disasters
 * Auth: DISASTER_ADMIN or SUPER_ADMIN only
 */
export const createDisaster = async (
  req: Request<{}, {}, CreateDisasterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const disaster = await disasterService.createDisaster(req.body);
    res.status(201).json({
      success: true,
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List disasters with filters and pagination
 * GET /api/disasters
 * Auth: All authenticated users
 */
export const listDisasters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = req.query as unknown as ListDisastersQuery;
    const result = await disasterService.listDisasters(filters);
    res.status(200).json({
      success: true,
      data: result.disasters,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single disaster by ID with full details
 * GET /api/disasters/:id
 * Auth: All authenticated users
 */
export const getDisasterById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const disaster = await disasterService.getDisasterById(req.params.id);
    res.status(200).json({
      success: true,
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a disaster
 * PATCH /api/disasters/:id
 * Auth: DISASTER_ADMIN or SUPER_ADMIN only
 */
export const updateDisaster = async (
  req: Request<{ id: string }, {}, UpdateDisasterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const disaster = await disasterService.updateDisaster(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate a disaster (set status to ACTIVE)
 * POST /api/disasters/:id/activate
 * Auth: DISASTER_ADMIN or SUPER_ADMIN only
 */
export const activateDisaster = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const disaster = await disasterService.activateDisaster(req.params.id);
    res.status(200).json({
      success: true,
      data: disaster,
      message: 'Disaster activated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve a disaster (set status to RESOLVED)
 * POST /api/disasters/:id/resolve
 * Auth: DISASTER_ADMIN or SUPER_ADMIN only
 */
export const resolveDisaster = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const disaster = await disasterService.resolveDisaster(req.params.id);
    res.status(200).json({
      success: true,
      data: disaster,
      message: 'Disaster resolved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive a disaster (set status to ARCHIVED)
 * POST /api/disasters/:id/archive
 * Auth: DISASTER_ADMIN or SUPER_ADMIN only
 */
export const archiveDisaster = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const disaster = await disasterService.archiveDisaster(req.params.id);
    res.status(200).json({
      success: true,
      data: disaster,
      message: 'Disaster archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active disasters (for dashboard)
 * GET /api/disasters/active
 * Auth: All authenticated users
 */
export const getActiveDisasters = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const disasters = await disasterService.getActiveDisasters();
    res.status(200).json({
      success: true,
      data: disasters,
      count: disasters.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive statistics for a disaster
 * GET /api/disasters/:id/stats
 * Auth: NGO_COORDINATOR, DISASTER_ADMIN, or SUPER_ADMIN
 */
export const getDisasterStats = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await disasterService.getDisasterStats(req.params.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
