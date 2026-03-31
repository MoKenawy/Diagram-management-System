// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { logAction, getClientIp } from '../services/audit.service';
import { backupQueue, restoreQueue, replicationQueue } from '../queues/queue';

// ─── Config ──────────────────────────────────────────────────────

export async function getConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await adminService.getConfig();
    res.json(config);
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.validatedBody;

    await adminService.upsertConfig(data, req.user!.id);

    await logAction({
      userId: req.user!.id,
      action: 'CONFIG_UPDATED',
      targetType: 'SYSTEM',
      ipAddress: getClientIp(req),
      metadata: { keys: Object.keys(data) },
    });

    const updated = await adminService.getConfig();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ─── Audit Logs ──────────────────────────────────────────────────

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const query = Array.isArray(req.validatedQuery) ? req.validatedQuery[0] : req.validatedQuery;
    
    const result = await adminService.getAuditLogs(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Backups ─────────────────────────────────────────────────────

export async function getBackups(req: Request, res: Response, next: NextFunction) {
  try {
    const backups = await adminService.getBackups();
    const serialized = backups.map((b) => ({
      ...b,
      sizeBytes: b.sizeBytes.toString(),
    }));
    res.json(serialized);
  } catch (err) {
    next(err);
  }
}

export async function createBackup(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await adminService.createBackupRecord(req.user!.id);

    await backupQueue.add('backup', { backupRecordId: record.id });

    await logAction({
      userId: req.user!.id,
      action: 'BACKUP_TRIGGERED',
      targetType: 'BACKUP',
      targetId: record.id,
      ipAddress: getClientIp(req),
      metadata: {},
    });

    res.status(202).json({ backupRecordId: record.id });
  } catch (err) {
    next(err);
  }
}

export async function restoreBackup(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const backup = await adminService.getBackupById(id);
    if (!backup) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Backup record not found' });
      return;
    }

    if (backup.status !== 'SUCCESS') {
      res.status(400).json({
        error: 'INVALID_BACKUP',
        message: 'Can only restore from a successful backup',
      });
      return;
    }

    await restoreQueue.add('restore', { backupRecordId: id });

    await logAction({
      userId: req.user!.id,
      action: 'RESTORE_TRIGGERED',
      targetType: 'BACKUP',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {},
    });

    res.status(202).json({ message: 'Restore job enqueued', backupRecordId: id });
  } catch (err) {
    next(err);
  }
}

// ─── Replication ─────────────────────────────────────────────────

export async function getReplicationTargets(req: Request, res: Response, next: NextFunction) {
  try {
    const targets = await adminService.getReplicationTargets();
    res.json(targets);
  } catch (err) {
    next(err);
  }
}

export async function createReplicationTarget(req: Request, res: Response, next: NextFunction) {
  try {
    
    const validatedBody = Array.isArray(req.validatedBody) ? req.validatedBody[0] : req.validatedBody;
    const target = await adminService.createReplicationTarget(validatedBody);


    res.status(201).json(target);
  } catch (err) {
    next(err);
  }
}

export async function updateReplicationTarget(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const existing = await adminService.getReplicationTargetById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Replication target not found' });
      return;
    }

    const updated = await adminService.updateReplicationTarget(id, req.validatedBody);
    const { sshKeyPath, ...response } = updated;
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteReplicationTarget(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const existing = await adminService.getReplicationTargetById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Replication target not found' });
      return;
    }

    await adminService.deleteReplicationTarget(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function syncReplicationTarget(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const existing = await adminService.getReplicationTargetById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Replication target not found' });
      return;
    }

    await replicationQueue.add('replication', { targetId: id });

    res.status(202).json({ message: 'Replication job enqueued', targetId: id });
  } catch (err) {
    next(err);
  }
}