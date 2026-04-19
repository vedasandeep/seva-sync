import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
  organization: z.string().optional(),
  region: z.string().optional(),
});

export const registerVolunteerSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  language: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const loginVolunteerSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
