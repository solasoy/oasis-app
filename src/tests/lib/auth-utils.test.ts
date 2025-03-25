import { 
  generateTemporaryPassword, 
  validatePasswordComplexity,
  generateMemorablePassword
} from '@/lib/auth-utils';

describe('Authentication Utilities', () => {
  describe('generateTemporaryPassword', () => {
    const testCases = [10, 12, 15, 20];

    testCases.forEach(length => {
      test(`generates a password of length ${length} with guaranteed complexity`, () => {
        const password = generateTemporaryPassword(length);
        
        // Check password length
        expect(password.length).toBe(length);
        
        // Verify complexity requirements
        expect(password).toMatch(/[A-Z]/); // At least one uppercase letter
        expect(password).toMatch(/[a-z]/); // At least one lowercase letter
        expect(password).toMatch(/[0-9]/); // At least one number
        expect(password).toMatch(/[!@#$%^&*]/); // At least one special character
      });
    });

    test('generates unique passwords', () => {
      const passwords = new Set();
      const numPasswords = 100;

      // Generate multiple passwords
      for (let i = 0; i < numPasswords; i++) {
        const password = generateTemporaryPassword();
        passwords.add(password);
      }

      // Expect most passwords to be unique
      expect(passwords.size).toBeGreaterThan(numPasswords * 0.9);
    });
  });

  describe('validatePasswordComplexity', () => {
    const validPasswords = [
      'StrongPass123!',
      'Secure@2023',
      'Complex#Password456',
      'Test!ng123'
    ];

    const invalidPasswords = [
      '', // Empty string
      'short',
      'nouppercase123!',
      'NOLOWERCASE123!',
      'NoNumbers!',
      'NoSpecialChars123'
    ];

    validPasswords.forEach(password => {
      test(`validates complex password: ${password}`, () => {
        expect(validatePasswordComplexity(password)).toBe(true);
      });
    });

    invalidPasswords.forEach(password => {
      test(`rejects invalid password: ${password}`, () => {
        expect(validatePasswordComplexity(password)).toBe(false);
      });
    });
  });

  describe('generateMemorablePassword', () => {
    test('generates a memorable password with correct structure', () => {
      const password = generateMemorablePassword();
      
      // Check password components
      expect(password).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{3}[!@#$%&*]$/);
      
      // Verify length
      expect(password.length).toBeGreaterThan(8);
      expect(password.length).toBeLessThan(20);
    });

    test('generates unique memorable passwords', () => {
      const passwords = new Set();
      const numPasswords = 100;

      // Generate multiple passwords
      for (let i = 0; i < numPasswords; i++) {
        const password = generateMemorablePassword();
        passwords.add(password);
      }

      // Expect most passwords to be unique
      expect(passwords.size).toBeGreaterThan(numPasswords * 0.9);
    });
  });
});