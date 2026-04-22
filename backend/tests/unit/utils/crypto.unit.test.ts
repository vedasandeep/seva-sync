
import {
  encryptPhone,
  decryptPhone,
  hashPhone,
  generateRandomToken,
} from '../../../src/shared/utils/crypto';

describe('Crypto Utilities', () => {
  describe('Phone Encryption/Decryption', () => {
    const testPhone = '+14155552671';

    it('should encrypt a phone number', () => {
      const encrypted = encryptPhone(testPhone);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).toMatch(/^[a-f0-9:]+$/); // Should be hex with colons
      expect(encrypted.split(':').length).toBe(3); // iv:encrypted:authTag
    });

    it('should decrypt to original phone number', () => {
      const encrypted = encryptPhone(testPhone);
      const decrypted = decryptPhone(encrypted);
      expect(decrypted).toBe(testPhone);
    });

    it('should produce different ciphertext for same phone (due to random IV)', () => {
      const encrypted1 = encryptPhone(testPhone);
      const encrypted2 = encryptPhone(testPhone);
      expect(encrypted1).not.toBe(encrypted2);
      // But both should decrypt to the same value
      expect(decryptPhone(encrypted1)).toBe(testPhone);
      expect(decryptPhone(encrypted2)).toBe(testPhone);
    });

    it('should handle different phone formats', () => {
      const phones = [
        '+14155552671',
        '+919876543210',
        '+61412345678',
        '14155552671',
        '9876543210',
      ];

      phones.forEach(phone => {
        const encrypted = encryptPhone(phone);
        const decrypted = decryptPhone(encrypted);
        expect(decrypted).toBe(phone);
      });
    });

    it('should throw error for invalid encrypted format', () => {
      expect(() => decryptPhone('invalid')).toThrow('Invalid encrypted data format');
      expect(() => decryptPhone('a:b')).toThrow('Invalid encrypted data format');
      expect(() => decryptPhone('a:b:c:d')).toThrow('Invalid encrypted data format');
    });

    it('should throw error for corrupted encrypted data', () => {
      const encrypted = encryptPhone(testPhone);
      const [iv, enc, authTag] = encrypted.split(':');
      const corrupted = `${iv}:${enc.substring(0, enc.length - 2)}FF:${authTag}`;
      
      expect(() => decryptPhone(corrupted)).toThrow();
    });
  });

  describe('Phone Hashing', () => {
    const testPhone = '+14155552671';

    it('should hash a phone number', () => {
      const hash = hashPhone(testPhone);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should produce deterministic hash', () => {
      const hash1 = hashPhone(testPhone);
      const hash2 = hashPhone(testPhone);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different phones', () => {
      const hash1 = hashPhone('+14155552671');
      const hash2 = hashPhone('+14155552672');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle various phone formats', () => {
      const phones = [
        '+14155552671',
        '+919876543210',
        '+61412345678',
        '14155552671',
      ];

      const hashes = phones.map(hashPhone);
      // All should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });

    it('should handle phone string consistently', () => {
      const hash1 = hashPhone('+14155552671');
      const hash2 = hashPhone('+14155552671');
      expect(hash1).toBe(hash2);
    });
  });

  describe('Random Token Generation', () => {
    it('should generate a random token', () => {
      const token = generateRandomToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique tokens', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      expect(token1).not.toBe(token2);
    });

    it('should respect custom byte length', () => {
      const token16 = generateRandomToken(16);
      const token32 = generateRandomToken(32);
      const token64 = generateRandomToken(64);

      expect(token16.length).toBe(32); // 16 bytes = 32 hex chars
      expect(token32.length).toBe(64); // 32 bytes = 64 hex chars
      expect(token64.length).toBe(128); // 64 bytes = 128 hex chars
    });

    it('should return hex format string', () => {
      const token = generateRandomToken();
      expect(token).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('Encryption Security', () => {
    it('should use AES-256-GCM algorithm', () => {
      const phone = 'test-phone';
      const encrypted = encryptPhone(phone);
      const [iv, , authTag] = encrypted.split(':');

      // IV should be 32 hex chars (16 bytes)
      expect(iv.length).toBe(32);

      // Auth tag should be 32 hex chars (16 bytes)
      expect(authTag.length).toBe(32);
    });

    it('should prevent tampering detection', () => {
      const phone = '+14155552671';
      const encrypted = encryptPhone(phone);
      const [iv, , authTag] = encrypted.split(':');

      // Tamper with the encrypted data
      const tamperedEnc = encrypted.split(':')[1].substring(0, encrypted.split(':')[1].length - 2) + '00';
      const tampered = `${iv}:${tamperedEnc}:${authTag}`;

      expect(() => decryptPhone(tampered)).toThrow();
    });
  });
});
