// src/services/users.service.ts
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { CreateUserInput, UpdateUserInput, UsersQueryInput } from '../schemas/users.schema';
import { Prisma } from '@prisma/client';

const SALT_ROUNDS = 12;

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
      select: {
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
      },
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

  const user = await prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      email: data.email ?? null,
      role: data.role,
      departmentId: data.departmentId ?? null,
      passwordHash,
    },
    select: {
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
    },
  });

  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
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
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
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
    },
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