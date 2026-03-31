// src/services/departments.service.ts
import   { prisma } from '../lib/prisma';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../schemas/departments.schema';

export async function getAllActiveDepartments() {
  return prisma.department.findMany({
    where: {},
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      code: true,
    },
    orderBy: { nameEn: 'asc' },
  });
}

export async function getAllDepartments() {
  return prisma.department.findMany({
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      code: true,
    },
    orderBy: { nameEn: 'asc' },
  });
}

export async function getDepartmentStats(id: string) {
  const department = await prisma.department.findUnique({
    where: { id },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      code: true,
    },
  });

  if (!department) return null;

  const [activeUserCount, totalUserCount, activeDiagramCount, totalDiagramCount] = await Promise.all([
    prisma.user.count({ where: { departmentId: id, isActive: true } }),
    prisma.user.count({ where: { departmentId: id } }),
    prisma.diagram.count({ where: { departmentId: id, isActive: true } }),
    prisma.diagram.count({ where: { departmentId: id } }),
  ]);

  return {
    ...department,
    activeUserCount,
    totalUserCount,
    activeDiagramCount,
    totalDiagramCount,
  };
}

export async function checkDepartmentCodeExists(code: string, excludeId?: string): Promise<boolean> {
  const normalizedCode = code.toUpperCase();
  const where: any = { code: normalizedCode };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existing = await prisma.department.findFirst({ where });
  return !!existing;
}

export async function createDepartment(data: CreateDepartmentInput) {
  return prisma.department.create({
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      code: data.code, // Already uppercased by Zod transform
    },
  });
}

export async function updateDepartment(id: string, data: UpdateDepartmentInput) {
  return prisma.department.update({
    where: { id },
    data,
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({ where: { id } });
}

export async function deactivateDepartment(id: string) {
  // Return counts for guard checks
  const activeUserCount = await prisma.user.count({
    where: { departmentId: id, isActive: true },
  });

  if (activeUserCount > 0) {
    return {
      success: false as const,
      error: 'DEPARTMENT_HAS_ACTIVE_USERS',
      message: `Cannot deactivate: department has ${activeUserCount} active user(s). Reassign or deactivate them first.`,
      count: activeUserCount,
    };
  }

  const activeDiagramCount = await prisma.diagram.count({
    where: { departmentId: id, isActive: true },
  });

  if (activeDiagramCount > 0) {
    return {
      success: false as const,
      error: 'DEPARTMENT_HAS_ACTIVE_DIAGRAMS',
      message: `Cannot deactivate: department owns ${activeDiagramCount} active diagram(s). Reassign or deactivate them first.`,
      count: activeDiagramCount,
    };
  }

  const updated = await prisma.department.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true as const, department: updated };
}