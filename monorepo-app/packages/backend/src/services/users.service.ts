// src/services/users.service.ts
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { CreateUserInput, UpdateUserInput, UsersQueryInput } from '../schemas/users.schema';
import { Prisma, PrismaClient } from '@prisma/client';

const SALT_ROUNDS = 12;

// ─── Reusable select objects (DRY) ───────────────────────────────

const USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  role: true,
  departmentId: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  department: {
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      code: true,
    },
  },
} as const satisfies Prisma.UserSelect;

const USER_SELECT_NO_LOGIN = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  role: true,
  departmentId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: {
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      code: true,
    },
  },
} as const satisfies Prisma.UserSelect;

// ─── Queries ─────────────────────────────────────────────────────

export async function getUsers(query: UsersQueryInput) {
  const { page, limit, role, departmentId, isActive, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (role) where.role = role;
  if (departmentId) where.departmentId = departmentId;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getActiveEngineers() {
  return prisma.user.findMany({
    where: {
      role: 'ENGINEER',
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          code: true,
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });
}

export async function createUser(data: CreateUserInput) {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      email: data.email ?? null,
      role: data.role,
      departmentId: data.departmentId ?? null,
      passwordHash,
    },
    select: USER_SELECT_NO_LOGIN,
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
}

export async function resetPassword(id: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !!existing;
}

// ─── Deactivate User ─────────────────────────────────────────────

export async function deactivateUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: USER_SELECT,
  });
}

// ─── Activate User ───────────────────────────────────────────────

export async function activateUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    select: USER_SELECT,
  });
}

// ─── Deletion Impact ─────────────────────────────────────────────

export async function getUserDeletionImpact(id: string) {
  const [
    uploadedVersionCount,
    grantedAccessCount,
    auditLogCount,
    triggeredBackupCount,
  ] = await Promise.all([
    prisma.diagramVersion.count({ where: { uploadedById: id } }),
    prisma.diagramAccess.count({ where: { grantedById: id } }),
    prisma.auditLog.count({ where: { userId: id } }),
    prisma.backupRecord.count({ where: { triggeredById: id } }),
  ]);

  return {
    uploadedVersionCount,
    grantedAccessCount,
    auditLogCount,
    triggeredBackupCount,
    hasReferences:
      uploadedVersionCount > 0 ||
      grantedAccessCount > 0 ||
      auditLogCount > 0 ||
      triggeredBackupCount > 0,
  };
}

// ─── Delete User (typed transaction) ─────────────────────────────

export interface DeleteUserResult {
  success: boolean;
  error?: string;
  message?: string;
}

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export async function deleteUser(id: string): Promise<DeleteUserResult> {
  const impact = await getUserDeletionImpact(id);

  if (impact.hasReferences) {
    const details: string[] = [];
    if (impact.uploadedVersionCount > 0) {
      details.push(`${impact.uploadedVersionCount} uploaded version(s)`);
    }
    if (impact.grantedAccessCount > 0) {
      details.push(`${impact.grantedAccessCount} granted access rule(s)`);
    }
    if (impact.auditLogCount > 0) {
      details.push(`${impact.auditLogCount} audit log(s)`);
    }
    if (impact.triggeredBackupCount > 0) {
      details.push(`${impact.triggeredBackupCount} triggered backup(s)`);
    }

    return {
      success: false,
      error: 'USER_HAS_REFERENCES',
      message: `Cannot delete: user has ${details.join(', ')}. Deactivate the user instead.`,
    };
  }

  await prisma.$transaction(async (tx: TransactionClient) => {
    await tx.diagramAccess.deleteMany({
      where: {
        targetType: 'USER',
        targetId: id,
      },
    });

    await tx.user.delete({ where: { id } });
  });

  return { success: true };
}