import { z } from 'zod';
import dotenv from 'dotenv';

/**
 * Environment variable validation using Zod
 * Ensures all required variables are present and properly typed
 */

// Load environment variables
dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  
  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid connection string'),
  
  // JWT Secrets
  ACCESS_TOKEN_SECRET: z.string().min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
  
  // Encryption Key (32 bytes = 64 hex characters)
  ENCRYPTION_KEY: z.string()
    .length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)')
    .regex(/^[a-fA-F0-9]{64}$/, 'ENCRYPTION_KEY must be valid hex'),
  
  // Twilio/Exotel
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string().regex(/^\+?[0-9]{10,}$/, 'Invalid phone number format'),
  
  // Email Service (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default('noreply@sevasync.app'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('debug'),
});

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate and parse environment variables
 * Throws error if validation fails
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      throw new Error(`Environment validation failed:\n${issues}`);
    }
    throw error;
  }
}

/**
 * Get a validated environment variable
 * Validates on first call, then returns cached value
 */
export function getEnv(): Env {
  return validateEnv();
}

/**
 * Get a specific environment variable (with validation)
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  return getEnv()[key];
}

/**
 * Export parsed environment for use throughout the app
 */
export const env = getEnv();

export default env;
