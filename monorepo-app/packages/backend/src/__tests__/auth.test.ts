// src/__tests__/auth.test.ts
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword
} from '../controllers/auth.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'access-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me';

beforeAll(() => {
  // Ensure we have secrets set for testing
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
});

describe('Auth Utilities', () => {
  const dummyUser = {
    id: 'user-123',
    role: 'ADMIN',
    departmentId: 'dept-456',
  } as any;

  describe('JWT Tokens', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(dummyUser);
      expect(typeof token).toBe('string');
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.sub).toBe(dummyUser.id);
      expect(decoded.role).toBe(dummyUser.role);
      expect(decoded.departmentId).toBe(dummyUser.departmentId);
      expect(decoded.exp).toBeDefined();
    });

    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(dummyUser);
      expect(typeof token).toBe('string');
      // Verify token
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
      expect(decoded.sub).toBe(dummyUser.id);
      expect(decoded.exp).toBeDefined();
    });

    it('should verify an access token correctly', () => {
      const token = jwt.sign(
        { sub: dummyUser.id, role: dummyUser.role, departmentId: dummyUser.departmentId },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const payload = verifyAccessToken(token);
      expect(payload.sub).toBe(dummyUser.id);
      expect(payload.role).toBe(dummyUser.role);
      expect(payload.departmentId).toBe(dummyUser.departmentId);
    });

    it('should verify a refresh token correctly', () => {
      const token = jwt.sign(
        { sub: dummyUser.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      const payload = verifyRefreshToken(token);
      expect(payload.sub).toBe(dummyUser.id);
    });

    it('should throw an error for an invalid access token signature', () => {
      const invalidToken = jwt.sign({ sub: dummyUser.id }, 'wrong-secret');
      expect(() => verifyAccessToken(invalidToken)).toThrow('invalid signature');
    });

    it('should throw an error for an expired token', () => {
      const expiredToken = jwt.sign({ sub: dummyUser.id }, JWT_SECRET, { expiresIn: '-1s' });
      expect(() => verifyAccessToken(expiredToken)).toThrow('jwt expired');
    });
  });

  describe('Password Hashing', () => {
    const plainTextPassword = 'SecurePassword123!';

    it('should hash a password and return a different string', async () => {
      const hash = await hashPassword(plainTextPassword);
      expect(hash).not.toBe(plainTextPassword);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should return true for a correct password comparison', async () => {
      const hash = await hashPassword(plainTextPassword);
      const isMatch = await comparePassword(plainTextPassword, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for an incorrect password comparison', async () => {
      const hash = await hashPassword(plainTextPassword);
      const isMatch = await comparePassword('WrongPassword!', hash);
      expect(isMatch).toBe(false);
    });
  });
});
