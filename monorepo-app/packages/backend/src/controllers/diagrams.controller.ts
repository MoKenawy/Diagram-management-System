// src/controllers/diagrams.controller.ts
import type { Request, Response, NextFunction } from 'express';
import fs, { PathLike } from 'fs';
import * as diagramsService from '../services/diagrams.service';
import { logAction, getClientIp } from '../services/audit.service';
import { getAccessibleDiagramIds } from '../utils/accessResolver';
import { fileFormatToMime } from '../utils/storage';
import { thumbnailQueue } from '../queues/thumbnail.queue';
import { prisma } from '../lib/prisma';
import type {
  CreateDiagramInput,
  UpdateDiagramInput,
  CreateVersionInput,
  ListDiagramsQuery,
  CreateAccessRuleInput,
} from '../schemas/diagrams.schema';
import { AccessLevel } from '@prisma/client';
import { logger } from '../utils/logger';
import { STORAGE_BASE_PATH } from '../config';
import path from 'path';
// ─── Response Types ──────────────────────────────────────────────

interface ErrorResponseBody {
  error: string;
  message: string;
}

interface DeactivateResponseBody {
  message: string;
  id: string;
}

interface DeleteAccessRuleResponseBody {
  message: string;
  ruleId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

function extractValidatedBody<T>(req: Request): T {
  const body: unknown = req.validatedBody;
  return (Array.isArray(body) ? body[0] : body) as T;
}

function extractValidatedQuery<T>(req: Request): T {
  const query: unknown = req.validatedQuery;
  return (Array.isArray(query) ? query[0] : query) as T;
}

function extractParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

function sendError(res: Response, status: number, error: string, message: string): void {
  const body: ErrorResponseBody = { error, message };
  res.status(status).json(body);
}

// ─── Diagram CRUD ────────────────────────────────────────────────

export async function createDiagram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 400, 'VALIDATION_ERROR', 'File is required');
      return;
    }

    const data = extractValidatedBody<CreateDiagramInput>(req);
    const userId: string = req.user!.id;
    const file: Express.Multer.File = req.file;

    const result = await diagramsService.createDiagram({
      ...data,
      file,
      uploadedById: userId,
    });

    await logAction({
      userId,
      action: 'DIAGRAM_CREATED',
      targetType: 'DIAGRAM',
      targetId: result.diagram.id,
      ipAddress: getClientIp(req),
      metadata: {
        title: data.title,
        departmentId: data.departmentId,
        versionId: result.version.id,
        originalFilename: file.originalname,
      },
    });

    await thumbnailQueue.add('generate', {
      versionId: result.version.id,
      filePath: file.path,
      fileFormat: result.version.fileFormat,
    });

    res.status(201).json({
      diagram: result.diagram,
      version: {
        ...result.version,
        fileSizeBytes: result.version.fileSizeBytes.toString(),
      },
    });
  } catch (err: unknown) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

export async function listDiagrams(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = extractValidatedQuery<ListDiagramsQuery>(req);
    const userRole: string = req.user!.role;
    const userId: string = req.user!.id;
    const userDeptId: string | null = req.user!.departmentId;
    const accessLevel : AccessLevel = AccessLevel.VIEW;
    let accessibleIds: string[] | undefined;

    if (userRole === 'ENGINEER') {
      accessibleIds = await getAccessibleDiagramIds(prisma, userId, userDeptId, accessLevel);
    }

    const result = await diagramsService.listDiagrams(query, accessibleIds);
    res.json(result);
  } catch (err: unknown) {
    next(err);
  }
}

export async function getDiagram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);

    const diagram = await diagramsService.getDiagramById(id);

    if (!diagram) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    res.json(diagram);
  } catch (err: unknown) {
    next(err);
  }
}

export async function updateDiagram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const data = extractValidatedBody<UpdateDiagramInput>(req);
    const userId: string = req.user!.id;

    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const updated = await diagramsService.updateDiagram(id, data);

    await logAction({
      userId,
      action: 'DIAGRAM_UPDATED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { updatedFields: Object.keys(data) },
    });

    res.json(updated);
  } catch (err: unknown) {
    next(err);
  }
}

export async function deleteDiagram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const userId: string = req.user!.id;

    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const deactivated = await diagramsService.deactivateDiagram(id);

    await logAction({
      userId,
      action: 'DIAGRAM_DEACTIVATED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { title: deactivated.title },
    });

    const body: DeactivateResponseBody = { message: 'Diagram deactivated', id };
    res.json(body);
  } catch (err: unknown) {
    next(err);
  }
}

// ─── Versions ────────────────────────────────────────────────────

export async function getVersions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);

    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const versions = await diagramsService.getVersions(id);

    const serialized = versions.map((v) => ({
      ...v,
      fileSizeBytes: v.fileSizeBytes.toString(),
    }));

    res.json(serialized);
  } catch (err: unknown) {
    next(err);
  }
}

export async function createVersion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const data = extractValidatedBody<CreateVersionInput>(req);
    const userId: string = req.user!.id;

    if (!req.file) {
      sendError(res, 400, 'VALIDATION_ERROR', 'File is required');
      return;
    }

    const file: Express.Multer.File = req.file;

    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const version = await diagramsService.createVersion({
      diagramId: id,
      revisionLabel: data.revisionLabel,
      changeSummary: data.changeSummary,
      file,
      uploadedById: userId,
    });

    await logAction({
      userId,
      action: 'VERSION_UPLOADED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        versionId: version.id,
        versionNumber: version.versionNumber,
        revisionLabel: version.revisionLabel,
        originalFilename: file.originalname,
      },
    });

    await thumbnailQueue.add('generate', {
      versionId: version.id,
      filePath: file.path,
      fileFormat: version.fileFormat,
    });

    res.status(201).json({
      ...version,
      fileSizeBytes: version.fileSizeBytes.toString(),
    });
  } catch (err: unknown) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

export async function downloadVersionFile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const versionId: string = extractParam(req.params.versionId);

    const version = await diagramsService.getVersionById(versionId);
    if (!version || version.diagramId !== id) {
      sendError(res, 404, 'NOT_FOUND', 'Version not found');
      return;
    }

    if (!fs.existsSync(version.filePath)) {
      sendError(res, 404, 'FILE_NOT_FOUND', 'File not found on disk');
      return;
    }

    const stat: fs.Stats = fs.statSync(version.filePath);
    const fileSize: number = stat.size;
    const mimeType: string = fileFormatToMime(version.fileFormat);
    const encodedFilename: string = encodeURIComponent(version.originalFilename);

    await logAction({
      userId: req.user!.id,
      action: 'DIAGRAM_DOWNLOADED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        versionId: version.id,
        versionNumber: version.versionNumber,
        originalFilename: version.originalFilename,
      },
    });

    const rangeHeader: string | undefined = req.headers.range;

    if (rangeHeader) {
      const parts: string[] = rangeHeader.replace(/bytes=/, '').split('-');
      const start: number = parseInt(parts[0], 10);
      const end: number = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      const chunkSize: number = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodedFilename}"`,
      });

      fs.createReadStream(version.filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="${encodedFilename}"`,
      });

      fs.createReadStream(version.filePath).pipe(res);
    }
  } catch (err: unknown) {
    next(err);
  }
}
export async function getVersionThumbnail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const versionId: string = extractParam(req.params.versionId);

    const version = await diagramsService.getVersionById(versionId);
    if (!version || version.diagramId !== id) {
      sendError(res, 404, 'NOT_FOUND', 'Version not found');
      return;
    }

    if (!version.thumbnailPath) {
      sendError(res, 404, 'THUMBNAIL_NOT_FOUND', 'No thumbnail available for this version');
      return;
    }

    let localThumbnailPath: string = version.thumbnailPath.toString();

    if (process.env.NODE_ENV === 'development') {
      localThumbnailPath = localThumbnailPath.replace('/app', STORAGE_BASE_PATH.toString());
    }

    if (!fs.existsSync(localThumbnailPath)) {
      sendError(res, 404, 'THUMBNAIL_NOT_FOUND', 'Thumbnail file not found on disk');
      return;
    }

    // Derive MIME from the actual thumbnail extension, not the original file format
    const THUMBNAIL_MIME: Record<string, string> = {
      '.svg':  'image/svg+xml',
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
    };

    const thumbExt = path.extname(localThumbnailPath).toLowerCase();
    const mimeType = THUMBNAIL_MIME[thumbExt] ?? 'application/octet-stream';
     logger.info(
      { versionId, thumbnailPath: localThumbnailPath, mimeType , thumbnailExt: thumbExt},
      'Serving thumbnail'
    );

    const stat: fs.Stats = fs.statSync(localThumbnailPath);

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stat.size,
      'Cache-Control': 'public, max-age=86400',
    });

    fs.createReadStream(localThumbnailPath).pipe(res);
  } catch (err: unknown) {
    next(err);
  }
}

// ─── Access Rules ────────────────────────────────────────────────

export async function getAccessRules(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);

    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const rules = await diagramsService.getAccessRules(id);
    res.json(rules);
  } catch (err: unknown) {
    next(err);
  }
}

export async function createAccessRule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const { targetType, targetId, accessLevel, policy } =
      extractValidatedBody<CreateAccessRuleInput>(req);
    const userId: string = req.user!.id;
      
    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const tExists = await diagramsService.targetExists(targetType, targetId);
    if (!tExists) {
      sendError(res, 404, 'NOT_FOUND', 'Target user or department does not exist');
      return;
    }

    // checkDuplicateAccessRule returns the first record 
    const duplicate = await diagramsService.checkDuplicateAccessRule(
      id,
      targetType,
      targetId,
      policy,
      accessLevel
    );

    if (duplicate) {
      sendError(
        res,
        409,
        'DUPLICATE_RULE',
        'An identical access rule already exists for this target and policy'
      );
      return;
    }

    const rule = await diagramsService.createAccessRule({
      diagramId: id,
      targetType,
      targetId,
      accessLevel,
      policy,
      grantedById: userId,
    });

    await logAction({
      userId,
      action: 'ACCESS_RULE_ADDED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        ruleId: rule.id,
        ruleTargetType: targetType,
        ruleTargetId: targetId,
        accessLevel,
        policy,
      },
    });

    res.status(201).json(rule);
  } catch (err: unknown) {
    next(err);
  }
}

export async function deleteAccessRule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = extractParam(req.params.id);
    const ruleId: string = extractParam(req.params.ruleId);
    const userId: string = req.user!.id;

    const exists: boolean = await diagramsService.diagramExists(id);
    if (!exists) {
      sendError(res, 404, 'NOT_FOUND', 'Diagram not found');
      return;
    }

    const deleted = await diagramsService.deleteAccessRule(ruleId, id);
    if (!deleted) {
      sendError(res, 404, 'NOT_FOUND', 'Access rule not found for this diagram');
      return;
    }

    await logAction({
      userId,
      action: 'ACCESS_RULE_REMOVED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        ruleId: deleted.id,
        ruleTargetType: deleted.targetType,
        ruleTargetId: deleted.targetId,
        policy: deleted.policy,
      },
    });

    const body: DeleteAccessRuleResponseBody = {
      message: 'Access rule removed',
      ruleId: deleted.id,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    next(err);
  }
}