// src/routes/diagrams.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import { checkDiagramAccess } from '../utils/accessResolver';
import { uploadSingle } from '../utils/storage';
import {
  createDiagramSchema,
  updateDiagramSchema,
  createVersionSchema,
  listDiagramsQuerySchema,
  createAccessRuleSchema,
} from '../schemas/diagrams.schema';
import * as ctrl from '../controllers/diagrams.controller';
import { AccessLevel } from '@prisma/client';

const router = Router();

router.use(authenticate);

// ── Diagram CRUD ─────────────────────────────────────────────

router.post(
  '/',
  authorize('DC', 'ADMIN'),
  uploadSingle('file'),
  validate(createDiagramSchema, 'body'),
  ctrl.createDiagram
);

router.get(
  '/',
  validate(listDiagramsQuerySchema, 'query'),
  ctrl.listDiagrams
);

router.get('/:id', checkDiagramAccess(AccessLevel.VIEW,'id'), ctrl.getDiagram);

router.patch(
  '/:id',
  authorize('DC', 'ADMIN', 'ENGINEER'),
  checkDiagramAccess(AccessLevel.UPDATE,'id'),
  validate(updateDiagramSchema, 'body'),
  ctrl.updateDiagram
);

router.delete('/:id', authorize('DC', 'ADMIN'),
checkDiagramAccess(AccessLevel.DELETE,'id'),
ctrl.deleteDiagram);

// ── Versions ─────────────────────────────────────────────────

router.get('/:id/versions', checkDiagramAccess(AccessLevel.VIEW,'id'), ctrl.getVersions);

router.post(
  '/:id/versions',
  authorize('DC', 'ADMIN'),
  checkDiagramAccess(AccessLevel.CREATE,'id'),
  uploadSingle('file'),
  validate(createVersionSchema, 'body'),
  ctrl.createVersion
);

router.get(
  '/:id/versions/:versionId/file',
  checkDiagramAccess(AccessLevel.VIEW,'id'),
  ctrl.downloadVersionFile
);

router.get(
  '/:id/versions/:versionId/thumbnail',
  checkDiagramAccess(AccessLevel.VIEW,'id'),
  ctrl.getVersionThumbnail
);

// ── Access Rules ─────────────────────────────────────────────

router.get('/:id/access', authorize('DC', 'ADMIN'),
checkDiagramAccess(AccessLevel.ADMIN,'id'),
ctrl.getAccessRules);

router.post(
  '/:id/access',
  authorize('DC', 'ADMIN'),
  checkDiagramAccess(AccessLevel.ADMIN, 'id'),
  validate(createAccessRuleSchema, 'body'),
  ctrl.createAccessRule
);

router.delete('/:id/access/:ruleId', authorize('DC','ADMIN'),
checkDiagramAccess(AccessLevel.ADMIN, 'id'),
ctrl.deleteAccessRule);

export default router;