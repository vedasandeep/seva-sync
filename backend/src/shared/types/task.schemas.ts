import { z } from 'zod';
import { TaskStatus, TaskUrgency, TaskType } from '@prisma/client';

export const createTaskSchema = z.object({
  disasterId: z.string().uuid('Invalid disaster ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(TaskType).default('OTHER'),
  requiredSkills: z.array(z.string()).max(10).optional(),
  urgency: z.nativeEnum(TaskUrgency),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  estimatedHours: z.number().int().min(1).max(100).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(TaskType).optional(),
  requiredSkills: z.array(z.string()).max(10).optional(),
  urgency: z.nativeEnum(TaskUrgency).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  estimatedHours: z.number().int().min(1).max(100).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const assignTaskSchema = z.object({
  volunteerId: z.string().uuid('Invalid volunteer ID'),
});

export const completeTaskSchema = z.object({
  volunteerId: z.string().uuid('Invalid volunteer ID'),
  hoursLogged: z.number().min(0.1).max(24),
  notes: z.string().max(1000).optional(),
  gpsLat: z.number().min(-90).max(90).optional(),
  gpsLng: z.number().min(-180).max(180).optional(),
  proofMediaUrl: z.string().url().optional(),
});

export const taskFiltersSchema = z.object({
  disasterId: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  type: z.nativeEnum(TaskType).optional(),
  urgency: z.nativeEnum(TaskUrgency).optional(),
  assignedVolunteerId: z.string().uuid().optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  offset: z.string().transform((val) => parseInt(val, 10)).optional(),
});

export const nearbyTasksSchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  radius: z.string().transform((val) => parseInt(val, 10)).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  urgency: z.nativeEnum(TaskUrgency).optional(),
});

export const bulkUpdateTaskSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.nativeEnum(TaskStatus).optional(),
  urgency: z.nativeEnum(TaskUrgency).optional(),
  type: z.nativeEnum(TaskType).optional(),
  assignedVolunteerId: z.string().uuid().optional(),
  archived: z.boolean().optional(),
});
