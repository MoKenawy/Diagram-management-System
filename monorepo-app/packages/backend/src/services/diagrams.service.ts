// src/services/diagrams.service.ts
import { prisma } from '../lib/prisma';
import { Prisma, FileFormat, PrismaClient, TargetType, AccessLevel, AccessPolicy } from '@prisma/client';
import {
  CreateDiagramInput,
  UpdateDiagramInput,
  ListDiagramsQuery,
} from '../schemas/diagrams.schema';
import path from 'path';
import { extensionToFileFormat } from '../utils/storage';
import { parseDate } from '../utils/dateFormatter';
import { logger } from '../utils/logger';

// ─── Typed transaction client ────────────────────────────────────

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

// ─── Reusable select objects ─────────────────────────────────────

const DEPARTMENT_SELECT = {
  id: true,
  nameAr: true,
  nameEn: true,
  code: true,
} as const satisfies Prisma.DepartmentSelect;

const UPLOADER_SELECT = {
  id: true,
  username: true,
  fullName: true,
} as const satisfies Prisma.UserSelect;

const TAG_SELECT = {
  id: true,
  tag: true,
} as const satisfies Prisma.DiagramTagSelect;

const DIAGRAM_INCLUDE = {
  department: { select: DEPARTMENT_SELECT },
  tags: { select: TAG_SELECT },
  _count: { select: { versions: true } },
} as const satisfies Prisma.DiagramInclude;

const VERSION_INCLUDE = {
  uploadedBy: { select: UPLOADER_SELECT },
} as const satisfies Prisma.DiagramVersionInclude;

// ─── Create Diagram + Version 1 ─────────────────────────────────

export interface CreateDiagramData extends CreateDiagramInput {
  file: Express.Multer.File;
  uploadedById: string;
}

export async function createDiagram(data: CreateDiagramData) {
  const {
    title,
    description,
    departmentId,
    tags,
    revisionLabel,
    changeSummary,
    file,
    uploadedById,
  } = data;

  const ext = path.extname(file.originalname).toLowerCase();
  const fileFormat = extensionToFileFormat(ext) as FileFormat;

  const result = await prisma.$transaction(async (tx: TransactionClient) => {
    const diagram = await tx.diagram.create({
      data: {
        title,
        description: description ?? null,
        departmentId,
        isActive: true,
      },
    });

    const version = await tx.diagramVersion.create({
      data: {
        diagramId: diagram.id,
        versionNumber: 1,
        revisionLabel,
        changeSummary,
        filePath: file.path,
        originalFilename: file.originalname,
        fileFormat,
        fileSizeBytes: BigInt(file.size),
        uploadedById,
      },
    });

    const updatedDiagram = await tx.diagram.update({
      where: { id: diagram.id },
      data: { currentVersionId: version.id },
    });

    if (tags && tags.length > 0) {
      const tagData: Prisma.DiagramTagCreateManyInput[] = tags.map((tag: string) => ({
        diagramId: diagram.id,
        tag,
      }));

      await tx.diagramTag.createMany({ data: tagData });
    }

    return { diagram: updatedDiagram, version };
  });

  return result;
}

// ─── List Diagrams ───────────────────────────────────────────────

export async function listDiagrams(
  query: ListDiagramsQuery,
  accessibleIds?: string[]
) {
  const { page, limit, search, fileFormat, departmentId, uploadedFrom, uploadedTo } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DiagramWhereInput = {
    isActive: true,
  };



  if (accessibleIds !== undefined) {
    if (accessibleIds.length === 0) {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    where.id = { in: accessibleIds };
  }

  if (departmentId && departmentId.length > 0) {
    where.departmentId = {
      in: departmentId,
    };
  }


  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { tags: { some: { tag: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (fileFormat && fileFormat.length > 0) {
    where.versions = {
      some: {
        fileFormat: { in: fileFormat },
      },
    };
  }


if (uploadedFrom || uploadedTo) {
  const dateFilter: Prisma.DateTimeFilter = {};

  if (uploadedFrom) {
  dateFilter.gte = parseDate(uploadedFrom);

  }
  
  if (uploadedTo) {
    const toDate = parseDate(uploadedTo);
    toDate.setDate(toDate.getDate() + 1);
    dateFilter.lt = toDate; 
  }

  where.createdAt = dateFilter;
}


  const [diagrams, total] = await Promise.all([
    prisma.diagram.findMany({
      where,
      include: DIAGRAM_INCLUDE,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.diagram.count({ where }),
  ]);

  const currentVersionIds = diagrams
    .map((d) => d.currentVersionId)
    .filter((id): id is string => id !== null);

  const currentVersions =
    currentVersionIds.length > 0
      ? await prisma.diagramVersion.findMany({
        where: { id: { in: currentVersionIds } },
        include: VERSION_INCLUDE,
      })
      : [];

  const versionMap = new Map(currentVersions.map((v) => [v.id, v]));

  const data = diagrams.map((diagram) => {
    const currentVersion = diagram.currentVersionId
      ? versionMap.get(diagram.currentVersionId) ?? null
      : null;

    return {
      id: diagram.id,
      title: diagram.title,
      description: diagram.description,
      departmentId: diagram.departmentId,
      department: diagram.department,
      currentVersionId: diagram.currentVersionId,
      isActive: diagram.isActive,
      createdAt: diagram.createdAt,
      updatedAt: diagram.updatedAt,
      tags: diagram.tags.map((t) => t.tag),
      versionCount: diagram._count.versions,
      currentVersion: currentVersion
        ? {
          id: currentVersion.id,
          versionNumber: currentVersion.versionNumber,
          revisionLabel: currentVersion.revisionLabel,
          changeSummary: currentVersion.changeSummary,
          fileFormat: currentVersion.fileFormat,
          fileSizeBytes: currentVersion.fileSizeBytes.toString(),
          originalFilename: currentVersion.originalFilename,
          thumbnailPath: currentVersion.thumbnailPath,
          uploadedAt: currentVersion.uploadedAt,
          uploadedBy: currentVersion.uploadedBy,
        }
        : null,
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Single Diagram ─────────────────────────────────────────

export async function getDiagramById(id: string) {
  const diagram = await prisma.diagram.findUnique({
    where: { id },
    include: DIAGRAM_INCLUDE,
  });

  if (!diagram) return null;

  let currentVersion = null;
  if (diagram.currentVersionId) {
    currentVersion = await prisma.diagramVersion.findUnique({
      where: { id: diagram.currentVersionId },
      include: VERSION_INCLUDE,
    });
  }

  return {
    id: diagram.id,
    title: diagram.title,
    description: diagram.description,
    departmentId: diagram.departmentId,
    department: diagram.department,
    currentVersionId: diagram.currentVersionId,
    isActive: diagram.isActive,
    createdAt: diagram.createdAt,
    updatedAt: diagram.updatedAt,
    tags: diagram.tags.map((t) => t.tag),
    versionCount: diagram._count.versions,
    currentVersion: currentVersion
      ? {
        id: currentVersion.id,
        versionNumber: currentVersion.versionNumber,
        revisionLabel: currentVersion.revisionLabel,
        changeSummary: currentVersion.changeSummary,
        fileFormat: currentVersion.fileFormat,
        fileSizeBytes: currentVersion.fileSizeBytes.toString(),
        originalFilename: currentVersion.originalFilename,
        thumbnailPath: currentVersion.thumbnailPath,
        uploadedAt: currentVersion.uploadedAt,
        uploadedBy: currentVersion.uploadedBy,
      }
      : null,
  };
}

// ─── Update Diagram ──────────────────────────────────────────────

export async function updateDiagram(id: string, data: UpdateDiagramInput) {
  const { tags, ...updateFields } = data;

  return prisma.$transaction(async (tx: TransactionClient) => {
    const updateData: Prisma.DiagramUpdateInput = {};
    if (updateFields.title !== undefined) updateData.title = updateFields.title;
    if (updateFields.description !== undefined) updateData.description = updateFields.description;

    if (Object.keys(updateData).length > 0) {
      await tx.diagram.update({
        where: { id },
        data: updateData,
      });
    }

    if (tags !== undefined) {
      await tx.diagramTag.deleteMany({ where: { diagramId: id } });

      if (tags.length > 0) {
        const tagData: Prisma.DiagramTagCreateManyInput[] = tags.map((tag: string) => ({
          diagramId: id,
          tag,
        }));

        await tx.diagramTag.createMany({ data: tagData });
      }
    }

    return tx.diagram.findUnique({
      where: { id },
      include: {
        department: { select: DEPARTMENT_SELECT },
        tags: { select: TAG_SELECT },
      },
    });
  });
}

// ─── Soft-delete Diagram ─────────────────────────────────────────

export async function deactivateDiagram(id: string) {
  return prisma.diagram.update({
    where: { id },
    data: { isActive: false },
  });
}

// ─── Versions ────────────────────────────────────────────────────

export async function getVersions(diagramId: string) {
  return prisma.diagramVersion.findMany({
    where: { diagramId },
    include: VERSION_INCLUDE,
    orderBy: { versionNumber: 'asc' },
  });
}

export interface CreateVersionData {
  diagramId: string;
  revisionLabel: string;
  changeSummary: string;
  file: Express.Multer.File;
  uploadedById: string;
}

export async function createVersion(data: CreateVersionData) {
  const { diagramId, revisionLabel, changeSummary, file, uploadedById } = data;

  const ext = path.extname(file.originalname).toLowerCase();
  const fileFormat = extensionToFileFormat(ext) as FileFormat;

  return prisma.$transaction(async (tx: TransactionClient) => {
    const maxVersion = await tx.diagramVersion.aggregate({
      where: { diagramId },
      _max: { versionNumber: true },
    });

    const nextVersionNumber = (maxVersion._max.versionNumber ?? 0) + 1;

    const version = await tx.diagramVersion.create({
      data: {
        diagramId,
        versionNumber: nextVersionNumber,
        revisionLabel,
        changeSummary,
        filePath: file.path,
        originalFilename: file.originalname,
        fileFormat,
        fileSizeBytes: BigInt(file.size),
        uploadedById,
      },
      include: VERSION_INCLUDE,
    });

    await tx.diagram.update({
      where: { id: diagramId },
      data: { currentVersionId: version.id },
    });

    return version;
  });
}

export async function getVersionById(versionId: string) {
  return prisma.diagramVersion.findUnique({
    where: { id: versionId },
    include: VERSION_INCLUDE,
  });
}

// ─── Access Rules ────────────────────────────────────────────────

export async function getUserDiagramAccess(userId: string, diagramId: string[]) {


}
          


export async function getAccessRules(diagramId: string) {
  const rules = await prisma.diagramAccess.findMany({
    where: { diagramId },
    include: {
      grantedBy: { select: UPLOADER_SELECT },
    },
    orderBy: { grantedAt: 'desc' },
  });

  const enriched = await Promise.all(
    rules.map(async (rule) => {
      let targetName: string | null = null;

      if (rule.targetType === 'USER') {
        const user = await prisma.user.findUnique({
          where: { id: rule.targetId },
          select: { fullName: true, username: true },
        });
        targetName = user ? `${user.fullName} (${user.username})` : null;
      } else if (rule.targetType === 'DEPARTMENT') {
        const dept = await prisma.department.findUnique({
          where: { id: rule.targetId },
          select: { nameEn: true, nameAr: true, code: true },
        });
        targetName = dept ? `${dept.nameEn} (${dept.code})` : null;
      }

      return {
        id: rule.id,
        diagramId: rule.diagramId,
        targetType: rule.targetType,
        targetId: rule.targetId,
        targetName,
        accessLevel: rule.accessLevel,
        policy: rule.policy,
        grantedAt: rule.grantedAt,
        grantedBy: rule.grantedBy,
      };
    })
  );

  return enriched;
}

export async function checkDuplicateAccessRule(
  diagramId: string,
  targetType: string,
  targetId: string,
  policy: string,
  accessLevel: string
) {
  const where: Prisma.DiagramAccessWhereInput = {
    diagramId,
    targetType: targetType as Prisma.EnumTargetTypeFilter['equals'],
    targetId,
    policy: policy as Prisma.EnumAccessPolicyFilter['equals'],
    accessLevel: accessLevel as Prisma.EnumAccessLevelFilter['equals'],
  };

  return prisma.diagramAccess.findFirst({ where });
}

export async function createAccessRule(data: {
  diagramId: string;
  targetType: string;
  targetId: string;
  accessLevel: string;
  policy: string;
  grantedById: string;
}) {
  const createData: Prisma.DiagramAccessCreateInput = {
    diagram: { connect: { id: data.diagramId } },
    targetType: data.targetType as TargetType,
    targetId: data.targetId,
    accessLevel: data.accessLevel as AccessLevel,
    policy: data.policy as AccessPolicy,
    grantedBy: { connect: { id: data.grantedById } },
  };

  return prisma.diagramAccess.create({
    data: createData,
    include: {
      grantedBy: { select: UPLOADER_SELECT },
    },
  });
}

export async function deleteAccessRule(ruleId: string, diagramId: string) {
  const rule = await prisma.diagramAccess.findFirst({
    where: { id: ruleId, diagramId },
  });

  if (!rule) return null;

  await prisma.diagramAccess.delete({ where: { id: ruleId } });
  return rule;
}

export async function diagramExists(id: string): Promise<boolean> {
  const d = await prisma.diagram.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!d;
}