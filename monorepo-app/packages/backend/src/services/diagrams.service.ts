// src/services/diagrams.service.ts
import { prisma } from '../lib/prisma';
import { Prisma, FileFormat } from '@prisma/client';
import {
  CreateDiagramInput,
  UpdateDiagramInput,
  ListDiagramsQuery,
} from '../schemas/diagrams.schema';
import path from 'path';
import { extensionToFileFormat } from '../utils/storage';

// ─── Create Diagram + Version 1 (transactional) ─────────────────

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

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create diagram
    const diagram = await tx.diagram.create({
      data: {
        title,
        description: description ?? null,
        departmentId,
        isActive: true,
      },
    });

    // 2. Create version 1
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

    // 3. Update diagram with currentVersionId
    const updatedDiagram = await tx.diagram.update({
      where: { id: diagram.id },
      data: { currentVersionId: version.id },
    });

    // 4. Create tags
    if (tags && tags.length > 0) {
      await tx.diagramTag.createMany({
        data: tags.map((tag: string) => ({
          diagramId: diagram.id,
          tag,
        })),
      });
    }

    return { diagram: updatedDiagram, version };
  });

  return result;
}

// ─── List Diagrams ───────────────────────────────────────────────

export async function listDiagrams(
  query: ListDiagramsQuery,
  accessibleIds?: string[] // undefined = all visible (DC/ADMIN/MANAGER)
) {
  const { page, limit, search, fileFormat, departmentId, uploadedFrom, uploadedTo } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DiagramWhereInput = {
    isActive: true,
  };

  // Engineer access restriction
  if (accessibleIds !== undefined) {
    if (accessibleIds.length === 0) {
      // No access to any diagram
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    where.id = { in: accessibleIds };
  }

  // Department filter
  if (departmentId) {
    where.departmentId = departmentId;
  }

  // Search: title or tag match
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      {
        tags: {
          some: { tag: { contains: search, mode: 'insensitive' } },
        },
      },
    ];
  }

  // File format filter: check current version's format
  // We need to handle this via a sub-relation filter
  if (fileFormat) {
    where.versions = {
      some: { fileFormat: fileFormat as FileFormat },
    };
  }

  // Upload date range
  if (uploadedFrom || uploadedTo) {
    where.createdAt = {};
    if (uploadedFrom) where.createdAt.gte = new Date(uploadedFrom);
    if (uploadedTo) where.createdAt.lte = new Date(uploadedTo);
  }

  const [diagrams, total] = await Promise.all([
    prisma.diagram.findMany({
      where,
      include: {
        department: {
          select: { id: true, nameAr: true, nameEn: true, code: true },
        },
        tags: {
          select: { id: true, tag: true },
        },
        // We need to fetch the current version separately since
        // currentVersionId is a plain string, not a relation.
        // We'll do a follow-up query.
        _count: {
          select: { versions: true },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.diagram.count({ where }),
  ]);

  // Fetch current versions in batch
  const currentVersionIds = diagrams
    .map((d) => d.currentVersionId)
    .filter((id): id is string => id !== null);

  const currentVersions =
    currentVersionIds.length > 0
      ? await prisma.diagramVersion.findMany({
          where: { id: { in: currentVersionIds } },
          include: {
            uploadedBy: {
              select: { id: true, username: true, fullName: true },
            },
          },
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
    include: {
      department: {
        select: { id: true, nameAr: true, nameEn: true, code: true },
      },
      tags: {
        select: { id: true, tag: true },
      },
      _count: {
        select: { versions: true },
      },
    },
  });

  if (!diagram) return null;

  // Fetch current version
  let currentVersion = null;
  if (diagram.currentVersionId) {
    currentVersion = await prisma.diagramVersion.findUnique({
      where: { id: diagram.currentVersionId },
      include: {
        uploadedBy: {
          select: { id: true, username: true, fullName: true },
        },
      },
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

// ─── Update Diagram metadata ────────────────────────────────────

export async function updateDiagram(
  id: string,
  data: UpdateDiagramInput
) {
  const { tags, ...updateFields } = data;

  return prisma.$transaction(async (tx) => {
    // Update core fields
    const updateData: Prisma.DiagramUpdateInput = {};
    if (updateFields.title !== undefined) updateData.title = updateFields.title;
    if (updateFields.description !== undefined) updateData.description = updateFields.description;

    if (Object.keys(updateData).length > 0) {
      await tx.diagram.update({
        where: { id },
        data: updateData,
      });
    }

    // Replace tags if provided
    if (tags !== undefined) {
      // Delete old tags
      await tx.diagramTag.deleteMany({ where: { diagramId: id } });

      // Insert new tags
      if (tags.length > 0) {
        await tx.diagramTag.createMany({
          data: tags.map((tag: string) => ({
            diagramId: id,
            tag,
          })),
        });
      }
    }

    return getDiagramByIdInternal(tx, id);
  });
}

// Internal helper that works inside a transaction
async function getDiagramByIdInternal(tx: Prisma.TransactionClient, id: string) {
  const diagram = await tx.diagram.findUnique({
    where: { id },
    include: {
      department: {
        select: { id: true, nameAr: true, nameEn: true, code: true },
      },
      tags: {
        select: { id: true, tag: true },
      },
    },
  });

  return diagram;
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
    include: {
      uploadedBy: {
        select: { id: true, username: true, fullName: true },
      },
    },
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

  return prisma.$transaction(async (tx) => {
    // Get next version number
    const maxVersion = await tx.diagramVersion.aggregate({
      where: { diagramId },
      _max: { versionNumber: true },
    });

    const nextVersionNumber = (maxVersion._max.versionNumber ?? 0) + 1;

    // Create version
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
      include: {
        uploadedBy: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });

    // Update diagram's currentVersionId
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
    include: {
      uploadedBy: {
        select: { id: true, username: true, fullName: true },
      },
    },
  });
}

// ─── Access Rules ────────────────────────────────────────────────

export async function getAccessRules(diagramId: string) {
  const rules = await prisma.diagramAccess.findMany({
    where: { diagramId },
    include: {
      grantedBy: {
        select: { id: true, username: true, fullName: true },
      },
    },
    orderBy: { grantedAt: 'desc' },
  });

  // For each rule, resolve the target name (user or department)
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
  policy: string
) {
  return prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      targetType: targetType as any,
      targetId,
      policy: policy as any,
    },
  });
}

export async function createAccessRule(data: {
  diagramId: string;
  targetType: string;
  targetId: string;
  accessLevel: string;
  policy: string;
  grantedById: string;
}) {
  return prisma.diagramAccess.create({
    data: {
      diagramId: data.diagramId,
      targetType: data.targetType as any,
      targetId: data.targetId,
      accessLevel: data.accessLevel as any,
      policy: data.policy as any,
      grantedById: data.grantedById,
    },
    include: {
      grantedBy: {
        select: { id: true, username: true, fullName: true },
      },
    },
  });
}

export async function deleteAccessRule(ruleId: string, diagramId: string) {
  // Ensure the rule belongs to the specified diagram
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