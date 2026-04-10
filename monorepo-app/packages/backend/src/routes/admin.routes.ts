// src/routes/admin.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import {
  updateConfigSchema,
  auditLogsQuerySchema,
  restoreSchema,
  createReplicationTargetSchema,
  updateReplicationTargetSchema,
} from '../schemas/admin.schema';
import * as ctrl from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

// Config
router.get('/config', ctrl.getConfig);
router.patch('/config', validate(updateConfigSchema, 'body'), ctrl.updateConfig);

// Audit Logs
router.get('/audit-logs', validate(auditLogsQuerySchema, 'query'), ctrl.getAuditLogs);

// Backups
router.get('/backups', ctrl.getBackups);

router.post('/backups', ctrl.createBackup);

router.post('/backups/:id/restore', validate(restoreSchema, 'body'), ctrl.restoreBackup);

// Replication
router.get('/replication', ctrl.getReplicationTargets);
router.post('/replication', validate(createReplicationTargetSchema, 'body'), ctrl.createReplicationTarget);
router.patch('/replication/:id', validate(updateReplicationTargetSchema, 'body'), ctrl.updateReplicationTarget);
router.delete('/replication/:id', ctrl.deleteReplicationTarget);
router.post('/replication/:id/sync', ctrl.syncReplicationTarget);

export default router;