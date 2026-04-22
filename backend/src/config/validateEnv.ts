import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Required environment variables for production
const REQUIRED_VARS = {
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL database connection URL',
    pattern: /^postgresql:\/\//,
    example: 'postgresql://user:password@host:5432/sevasync'
  },
  ACCESS_TOKEN_SECRET: {
    required: true,
    description: 'JWT access token secret (32+ characters)',
    minLength: 32,
    example: 'use `openssl rand -base64 32`'
  },
  REFRESH_TOKEN_SECRET: {
    required: true,
    description: 'JWT refresh token secret (32+ characters)',
    minLength: 32,
    example: 'use `openssl rand -base64 32`'
  },
  ENCRYPTION_KEY: {
    required: true,
    description: 'Data encryption key (32-byte hex string, 64 chars)',
    pattern: /^[a-f0-9]{64}$/i,
    example: 'use `openssl rand -hex 32`'
  },
  BASE_URL: {
    required: true,
    description: 'Base URL for the API server',
    pattern: /^https?:\/\//,
    example: 'https://sevasync-api.render.com'
  },
  NODE_ENV: {
    required: true,
    description: 'Node environment',
    allowedValues: ['development', 'production', 'test'],
    example: 'production'
  },
  ALLOWED_ORIGINS: {
    required: true,
    description: 'Comma-separated list of allowed CORS origins',
    example: 'https://sevasync-dashboard.vercel.app,https://sevasync-pwa.vercel.app'
  },
  PORT: {
    required: false,
    description: 'Server port number',
    default: '10000'
  }
};

interface EnvRule {
  required: boolean;
  description: string;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  allowedValues?: string[];
  default?: string;
  example?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  console.log('🔍 Validating environment variables...\n');

  for (const [varName, rule] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[varName];

    // Check if required variable is present
    if (rule.required && !value) {
      result.valid = false;
      result.errors.push(
        `❌ Missing required variable: ${varName}\n` +
        `   Description: ${rule.description}\n` +
        `   Example: ${rule.example}`
      );
      continue;
    }

    // Skip further validation if variable is not provided and not required
    if (!value) {
      if (rule.default) {
        console.log(`ℹ️  ${varName}: Using default value "${rule.default}"`);
      }
      continue;
    }

    // Validate pattern (regex)
    if (rule.pattern && !rule.pattern.test(value)) {
      result.valid = false;
      result.errors.push(
        `❌ Invalid format for ${varName}\n` +
        `   Current: ${value}\n` +
        `   Expected format: ${rule.pattern}\n` +
        `   Example: ${rule.example}`
      );
    }

    // Validate minimum length
    if (rule.minLength && value.length < rule.minLength) {
      result.valid = false;
      result.errors.push(
        `❌ ${varName} is too short\n` +
        `   Current length: ${value.length}\n` +
        `   Minimum required: ${rule.minLength} characters`
      );
    }

    // Validate maximum length
    if (rule.maxLength && value.length > rule.maxLength) {
      result.valid = false;
      result.errors.push(
        `❌ ${varName} is too long\n` +
        `   Current length: ${value.length}\n` +
        `   Maximum allowed: ${rule.maxLength} characters`
      );
    }

    // Validate allowed values
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      result.valid = false;
      result.errors.push(
        `❌ Invalid value for ${varName}\n` +
        `   Current: ${value}\n` +
        `   Allowed values: ${rule.allowedValues.join(', ')}`
      );
    }

    // Warn about weak secrets in development
    if ((varName === 'ACCESS_TOKEN_SECRET' || varName === 'REFRESH_TOKEN_SECRET') &&
        process.env.NODE_ENV === 'development' &&
        value === 'your-super-secret-access-token-key-change-this') {
      result.warnings.push(
        `⚠️  ${varName} uses default development value\n` +
        `   This is OK for development, but MUST be changed for production`
      );
    }
  }

  // Display results
  console.log('\n' + '='.repeat(60));

  if (result.errors.length > 0) {
    console.error('\n❌ VALIDATION FAILED\n');
    result.errors.forEach(error => console.error(`   ${error}\n`));
  } else {
    console.log('\n✅ All required variables are valid!\n');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  WARNINGS:\n');
    result.warnings.forEach(warning => console.warn(`   ${warning}\n`));
  }

  console.log('='.repeat(60) + '\n');

  return result;
}

/**
 * Print environment variable summary
 */
export function printEnvSummary(): void {
  console.log('📋 Environment Configuration Summary\n');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   PORT: ${process.env.PORT || '10000'}`);
  console.log(`   BASE_URL: ${process.env.BASE_URL || 'not set'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   JWT Secrets: ${process.env.ACCESS_TOKEN_SECRET ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   CORS Origins: ${process.env.ALLOWED_ORIGINS ? '✅ Configured' : '❌ Not set'}`);
  console.log();
}

// Run validation if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateEnvironment();
  printEnvSummary();
  process.exit(result.valid ? 0 : 1);
}

export default validateEnvironment;
