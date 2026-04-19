import { z } from 'zod';
import { DisasterType, DisasterStatus } from '@prisma/client';

/**
 * Schema for creating a new disaster
 * Aligned with Prisma Disaster model
 */
export const createDisasterSchema = z.object({
  name: z.string().min(3, 'Disaster name must be at least 3 characters').max(200),
  type: z.nativeEnum(DisasterType),
  location: z.string().min(3, 'Location must be at least 3 characters').max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  startDate: z.string().datetime().transform(str => new Date(str)),
});

/**
 * Schema for updating an existing disaster
 */
export const updateDisasterSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  location: z.string().min(3).max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  status: z.nativeEnum(DisasterStatus).optional(),
  endDate: z.string().datetime().transform(str => new Date(str)).optional(),
});

/**
 * Schema for listing disasters with filters
 */
export const listDisastersSchema = z.object({
  status: z.nativeEnum(DisasterStatus).optional(),
  type: z.nativeEnum(DisasterType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Schema for disaster ID parameter
 */
export const disasterIdSchema = z.object({
  id: z.string().uuid('Invalid disaster ID format'),
});

/**
 * Schema for activating a disaster (changing status to ACTIVE)
 */
export const activateDisasterSchema = z.object({
  activatedAt: z.string().datetime().optional(),
}).optional();

/**
 * Schema for resolving a disaster (changing status to RESOLVED)
 */
export const resolveDisasterSchema = z.object({
  resolvedAt: z.string().datetime().optional(),
}).optional();

// Type exports for use in controllers/services
export type CreateDisasterInput = z.infer<typeof createDisasterSchema>;
export type UpdateDisasterInput = z.infer<typeof updateDisasterSchema>;
export type ListDisastersQuery = z.infer<typeof listDisastersSchema>;
export type DisasterIdParam = z.infer<typeof disasterIdSchema>;
export type ActivateDisasterInput = z.infer<typeof activateDisasterSchema>;
export type ResolveDisasterInput = z.infer<typeof resolveDisasterSchema>;
