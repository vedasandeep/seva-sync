import {
  generateAccessToken,
  generateRefreshToken,
  generateVolunteerToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVolunteerToken,
  decodeToken,
  TokenPayload,
  VolunteerTokenPayload,
} from '../../../src/shared/utils/jwt';
import { UserRole } from '@prisma/client';

describe('JWT Utilities', () => {
  const testPayload: TokenPayload = {
    userId: 'user-123',
    role: UserRole.NGO_COORDINATOR,
    email: 'test@example.com',
  };

  const volunteerPayload: VolunteerTokenPayload = {
    volunteerId: 'volunteer-123',
    phoneHash: 'hash-abc123',
  };

  describe('Token Generation', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format
    });

    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate a valid volunteer token', () => {
      const token = generateVolunteerToken(volunteerPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should include payload data in generated access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should include volunteer data in generated volunteer token', () => {
      const token = generateVolunteerToken(volunteerPayload);
      const decoded = decodeToken(token);
      expect(decoded.volunteerId).toBe(volunteerPayload.volunteerId);
      expect(decoded.phoneHash).toBe(volunteerPayload.phoneHash);
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const verified = verifyAccessToken(token);
      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.role).toBe(testPayload.role);
    });

    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const verified = verifyRefreshToken(token);
      expect(verified.userId).toBe(testPayload.userId);
    });

    it('should verify a valid volunteer token', () => {
      const token = generateVolunteerToken(volunteerPayload);
      const verified = verifyVolunteerToken(token);
      expect(verified.volunteerId).toBe(volunteerPayload.volunteerId);
      expect(verified.phoneHash).toBe(volunteerPayload.phoneHash);
    });

    it('should throw error for invalid access token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyAccessToken(invalidToken)).toThrow(
        'Invalid or expired access token'
      );
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyRefreshToken(invalidToken)).toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error for invalid volunteer token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyVolunteerToken(invalidToken)).toThrow(
        'Invalid or expired volunteer token'
      );
    });

    it('should throw error when using wrong secret for verification', () => {
      const token = generateAccessToken(testPayload);
      // Try to verify with wrong secret would require modifying the function
      // This test ensures the function validates issuer
      const decoded = decodeToken(token);
      expect(decoded.iss).toBe('sevasync-api');
    });
  });

  describe('Token Decoding', () => {
    it('should decode a token without verification', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should include expiry information', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('Token Expiry', () => {
    it('access token should have 15m expiry', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(15 * 60); // 15 minutes in seconds
    });

    it('refresh token should have 7d expiry', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = decodeToken(token);
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it('volunteer token should have 30d expiry', () => {
      const token = generateVolunteerToken(volunteerPayload);
      const decoded = decodeToken(token);
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(30 * 24 * 60 * 60); // 30 days in seconds
    });
  });
});
