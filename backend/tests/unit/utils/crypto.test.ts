/**
 * Crypto Utilities Unit Tests
 * 
 * Tests for phone number encryption/decryption and hashing
 */

import {
  encryptPhone,
  decryptPhone,
  hashPhone,
  generateRandomToken,
} from '../../../src/utils/crypto';

describe('Crypto Utilities', () => {
  describe('encryptPhone / decryptPhone', () => {
    const testPhone = '+919876543210';

    it('should encrypt phone number', () => {
      const encrypted = encryptPhone(testPhone);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testPhone);
      // Format: iv:encrypted:authTag
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should decrypt phone number correctly', () => {
      const encrypted = encryptPhone(testPhone);
      const decrypted = decryptPhone(encrypted);
      
      expect(decrypted).toBe(testPhone);
    });

    it('should produce different ciphertexts for same input (random IV)', () => {
      const encrypted1 = encryptPhone(testPhone);
      const encrypted2 = encryptPhone(testPhone);
      
      // Different IVs should produce different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should decrypt both ciphertexts to same plaintext', () => {
      const encrypted1 = encryptPhone(testPhone);
      const encrypted2 = encryptPhone(testPhone);
      
      const decrypted1 = decryptPhone(encrypted1);
      const decrypted2 = decryptPhone(encrypted2);
      
      expect(decrypted1).toBe(testPhone);
      expect(decrypted2).toBe(testPhone);
    });

    it('should throw error for invalid encrypted format', () => {
      expect(() => decryptPhone('invalid-format')).toThrow('Invalid encrypted data format');
      expect(() => decryptPhone('only:two')).toThrow('Invalid encrypted data format');
    });

    it('should handle special characters in phone numbers', () => {
      const phoneWithSpaces = '+91 987 654 3210';
      const encrypted = encryptPhone(phoneWithSpaces);
      const decrypted = decryptPhone(encrypted);
      
      expect(decrypted).toBe(phoneWithSpaces);
    });

    it('should handle Unicode characters', () => {
      const withEmoji = '+919876543210 📱';
      const encrypted = encryptPhone(withEmoji);
      const decrypted = decryptPhone(encrypted);
      
      expect(decrypted).toBe(withEmoji);
    });
  });

  describe('hashPhone', () => {
    const testPhone = '+919876543210';

    it('should hash phone number', () => {
      const hash = hashPhone(testPhone);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      // SHA-256 produces 64 hex characters
      expect(hash).toHaveLength(64);
    });

    it('should produce consistent hash for same input', () => {
      const hash1 = hashPhone(testPhone);
      const hash2 = hashPhone(testPhone);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashPhone('+919876543210');
      const hash2 = hashPhone('+919876543211');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should be case-sensitive', () => {
      const hash1 = hashPhone('ABC');
      const hash2 = hashPhone('abc');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', () => {
      const hash = hashPhone('');
      
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });
  });

  describe('generateRandomToken', () => {
    it('should generate token with default length', () => {
      const token = generateRandomToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // 32 bytes = 64 hex characters
      expect(token).toHaveLength(64);
    });

    it('should generate token with custom length', () => {
      const token16 = generateRandomToken(16);
      const token48 = generateRandomToken(48);
      
      expect(token16).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(token48).toHaveLength(96); // 48 bytes = 96 hex chars
    });

    it('should generate unique tokens', () => {
      const tokens = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        tokens.add(generateRandomToken());
      }
      
      // All 100 tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it('should only contain hex characters', () => {
      const token = generateRandomToken();
      
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });
});
