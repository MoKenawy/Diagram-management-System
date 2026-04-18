// src/__tests__/helpers/mockPrisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { beforeEach, jest } from '@jest/globals';

// Create a deep mock of PrismaClient
const prismaMock = mockDeep<PrismaClient>();

// Replace the real PrismaClient export with our mock
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

// Reset the mock before each test
beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock };
