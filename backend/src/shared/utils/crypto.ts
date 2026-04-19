import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}

const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * Encrypt phone number using AES-256-GCM
 * Returns format: iv:encrypted:authTag (all hex)
 */
export function encryptPhone(phone: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(phone, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
}

/**
 * Decrypt phone number
 */
export function decryptPhone(encryptedData: string): string {
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, encryptedHex, authTagHex] = parts;
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    keyBuffer,
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}

/**
 * Hash phone number for indexed lookups
 * Uses SHA-256
 */
export function hashPhone(phone: string): string {
  return crypto
    .createHash('sha256')
    .update(phone)
    .digest('hex');
}

/**
 * Generate random token (for reset tokens, etc.)
 */
export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
