import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || '';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets must be configured in environment variables');
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email?: string;
}

export interface VolunteerTokenPayload {
  volunteerId: string;
  phoneHash: string;
}

/**
 * Generate access token (15 minutes expiry)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
    issuer: 'sevasync-api',
  });
}

/**
 * Generate refresh token (7 days expiry)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    issuer: 'sevasync-api',
  });
}

/**
 * Generate volunteer token (for phone-based auth)
 */
export function generateVolunteerToken(payload: VolunteerTokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '30d', // Longer expiry for volunteers
    issuer: 'sevasync-api',
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'sevasync-api',
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'sevasync-api',
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Verify volunteer token
 */
export function verifyVolunteerToken(token: string): VolunteerTokenPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'sevasync-api',
    }) as VolunteerTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired volunteer token');
  }
}

/**
 * Decode token without verification (for inspection)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}
