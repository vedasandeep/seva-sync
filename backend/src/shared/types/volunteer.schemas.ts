import { z } from 'zod';

export const updateVolunteerSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  language: z.string().min(2).max(10).optional(),
  skills: z.array(z.string()).max(20).optional(),
  availabilityRadiusKm: z.number().int().min(1).max(100).optional(),
  currentLat: z.number().min(-90).max(90).optional(),
  currentLng: z.number().min(-180).max(180).optional(),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const wellnessCheckinSchema = z.object({
  feeling: z.enum(['excellent', 'good', 'tired', 'exhausted', 'stressed', 'overwhelmed']),
  sentimentScore: z.number().min(-1).max(1).optional(),
  voiceNoteUrl: z.string().url().optional(),
});

export const volunteerFiltersSchema = z.object({
  isActive: z.string().transform((val) => val === 'true').optional(),
  skills: z.string().transform((val) => val.split(',')).optional(),
  minBurnoutScore: z.string().transform((val) => parseFloat(val)).optional(),
  maxBurnoutScore: z.string().transform((val) => parseFloat(val)).optional(),
  language: z.string().optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  offset: z.string().transform((val) => parseInt(val, 10)).optional(),
});

export const nearbyVolunteersSchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  radius: z.string().transform((val) => parseInt(val, 10)).optional(),
  skills: z.string().transform((val) => val.split(',')).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid volunteer ID format'),
});
