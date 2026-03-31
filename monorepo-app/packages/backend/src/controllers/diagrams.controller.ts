// src/controllers/diagrams.controller.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import * as diagramsService from '../services/diagrams.service';
import { logAction, getClientIp } from '../services/audit.service';
import { getAccessibleDiagramIds } from '../utils/accessResolver';
import { fileFormatToMime } from '../utils/storage';
import { thumbnailQueue } from '../queues/thumbnail.queue';
import { prisma } from '../lib/prisma';

// ─── Diagram CRUD ────────────────────────────────────────────────

export async function createDiagram(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'File is required' });
      return;
    }

    const data = Array.isArray(req.validatedBody) ? req.validatedBody[0] : req.validatedBody;

    const result = await diagramsService.createDiagram({
      ...data,
      file: req.file,
      uploadedById: req.user!.id,
    });

    await logAction({
      userId: req.user!.id,
      action: 'DIAGRAM_CREATED',
      targetType: 'DIAGRAM',
      targetId: result.diagram.id,
      ipAddress: getClientIp(req),
      metadata: {
        title: data.title,
        departmentId: data.departmentId,
        versionId: result.version.id,
        originalFilename: req.file.originalname,
      },
    });

    await thumbnailQueue.add('generate', {
      versionId: result.version.id,
      filePath: req.file.path,
      fileFormat: result.version.fileFormat,
    });

    res.status(201).json({
      diagram: result.diagram,
      version: {
        ...result.version,
        fileSizeBytes: result.version.fileSizeBytes.toString(),
      },
    });
  } catch (err) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

export async function listDiagrams(req: Request, res: Response, next: NextFunction) {
  try {
    const query = Array.isArray(req.validatedQuery) ? req.validatedQuery[0] : req.validatedQuery;
    let accessibleIds: string[] | undefined;

    if (req.user!.role === 'ENGINEER') {
      accessibleIds = await getAccessibleDiagramIds(
        prisma,
        req.user!.id,
        req.user!.departmentId
      );
    }

    const result = await diagramsService.listDiagrams(query, accessibleIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getDiagram(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const diagram = await diagramsService.getDiagramById(id);

    if (!diagram) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    res.json(diagram);
  } catch (err) {
    next(err);
  }
}

export async function updateDiagram(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const data = Array.isArray(req.validatedBody) ? req.validatedBody[0] : req.validatedBody;


    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const updated = await diagramsService.updateDiagram(id, data);

    await logAction({
      userId: req.user!.id,
      action: 'DIAGRAM_UPDATED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { updatedFields: Object.keys(data) },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteDiagram(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const deactivated = await diagramsService.deactivateDiagram(id);

    await logAction({
      userId: req.user!.id,
      action: 'DIAGRAM_DEACTIVATED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { title: deactivated.title },
    });

    res.json({ message: 'Diagram deactivated', id });
  } catch (err) {
    next(err);
  }
}

// ─── Versions ────────────────────────────────────────────────────

export async function getVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const versions = await diagramsService.getVersions(id);

    const serialized = versions.map((v) => ({
      ...v,
      fileSizeBytes: v.fileSizeBytes.toString(),
    }));

    res.json(serialized);
  } catch (err) {
    next(err);
  }
}

export async function createVersion(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const data = req.validatedBody;

    if (!req.file) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'File is required' });
      return;
    }

    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const version = await diagramsService.createVersion({
      diagramId: id,
      revisionLabel: data.revisionLabel,
      changeSummary: data.changeSummary,
      file: req.file,
      uploadedById: req.user!.id,
    });

    await logAction({
      userId: req.user!.id,
      action: 'VERSION_UPLOADED',
      targetType: 'DIAGRAM',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        versionId: version.id,
        versionNumber: version.versionNumber,
        revisionLabel: version.revisionLabel,
        originalFilename: req.file.originalname,
      },
    });

    await thumbnailQueue.add('generate', {
      versionId: version.id,
      filePath: req.file.path,
      fileFormat: version.fileFormat,
    });

    res.status(201).json({
      ...version,
      fileSizeBytes: version.fileSizeBytes.toString(),
    });
  } catch (err) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

export async function downloadVersionFile(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const versionId = Array.isArray(req.params.versionId) ? req.params.versionId[0] : req.params.versionId;

    const version = await diagramsService.getVersionById(versionId);
    if (!version || version.diagramId !== id) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Version not found' });
      return;
    }

    if (!fs.existsSync(version.filePath)) {
      res.status(404).json({ error: 'FILE_NOT_FOUND', message: 'File not found on disk' });
      return;
    }

    const stat = fs.statSync(version.filePath);
    const fileSize = stat.size;
    const mimeType = fileFormatToMime(version.fileFormat);

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

    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(version.originalFilename)}"`,
      });

      fs.createReadStream(version.filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(version.originalFilename)}"`,
      });

      fs.createReadStream(version.filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
}

export async function getVersionThumbnail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const versionId = Array.isArray(req.params.versionId) ? req.params.versionId[0] : req.params.versionId;

    const version = await diagramsService.getVersionById(versionId);
    if (!version || version.diagramId !== id) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Version not found' });
      return;
    }

    if (!version.thumbnailPath) {
      res.status(404).json({
        error: 'THUMBNAIL_NOT_FOUND',
        message: 'No thumbnail available for this version',
      });
      return;
    }

    if (!fs.existsSync(version.thumbnailPath)) {
      res.status(404).json({
        error: 'THUMBNAIL_NOT_FOUND',
        message: 'Thumbnail file not found on disk',
      });
      return;
    }

    const stat = fs.statSync(version.thumbnailPath);

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': stat.size,
      'Cache-Control': 'public, max-age=86400',
    });

    fs.createReadStream(version.thumbnailPath).pipe(res);
  } catch (err) {
    next(err);
  }
}

// ─── Access Rules ────────────────────────────────────────────────

export async function getAccessRules(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const rules = await diagramsService.getAccessRules(id);
    res.json(rules);
  } catch (err) {
    next(err);
  }
}

export async function createAccessRule(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const { targetType, targetId, accessLevel, policy } = req.validatedBody;

    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const duplicate = await diagramsService.checkDuplicateAccessRule(
      id,
      targetType,
      targetId,
      policy
    );

    if (duplicate) {
      res.status(409).json({
        error: 'DUPLICATE_RULE',
        message: 'An identical access rule already exists for this target and policy',
      });
      return;
    }

    const rule = await diagramsService.createAccessRule({
      diagramId: id,
      targetType,
      targetId,
      accessLevel,
      policy,
      grantedById: req.user!.id,
    });

    await logAction({
      userId: req.user!.id,
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
  } catch (err) {
    next(err);
  }
}

export async function deleteAccessRule(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ruleId = Array.isArray(req.params.ruleId) ? req.params.ruleId[0] : req.params.ruleId;

    const exists = await diagramsService.diagramExists(id);
    if (!exists) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Diagram not found' });
      return;
    }

    const deleted = await diagramsService.deleteAccessRule(ruleId, id);
    if (!deleted) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Access rule not found for this diagram',
      });
      return;
    }

    await logAction({
      userId: req.user!.id,
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

    res.status(200).json({ message: 'Access rule removed', ruleId: deleted.id });
  } catch (err) {
    next(err);
  }
}