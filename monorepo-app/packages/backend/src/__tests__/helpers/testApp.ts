// src/__tests__/helpers/testApp.ts
import app from '../../index'; // This gets the configured express app without starting listening due to our process.env.NODE_ENV check
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = JWT_SECRET;
}

export const testApp = app;

/**
 * Creates tokens for testing integration routes
 */
export const testTokens = {
  admin: () => jwt.sign({ sub: 'admin-123', role: 'ADMIN', departmentId: 'dept-hq' }, JWT_SECRET, { expiresIn: '1h' }),
  dc: () => jwt.sign({ sub: 'dc-123', role: 'DOCUMENT_CONTROLLER', departmentId: 'dept-dc' }, JWT_SECRET, { expiresIn: '1h' }),
  engineer: () => jwt.sign({ sub: 'eng-123', role: 'ENGINEER', departmentId: 'dept-eng' }, JWT_SECRET, { expiresIn: '1h' }),
  manager: () => jwt.sign({ sub: 'mgr-123', role: 'MANAGER', departmentId: 'dept-hq' }, JWT_SECRET, { expiresIn: '1h' }),
};
