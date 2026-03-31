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

router.get('/:id', checkDiagramAccess('id'), ctrl.getDiagram);

router.patch(
  '/:id',
  authorize('DC', 'ADMIN'),
  validate(updateDiagramSchema, 'body'),
  ctrl.updateDiagram
);

router.delete('/:id', authorize('DC', 'ADMIN'), ctrl.deleteDiagram);

// ── Versions ─────────────────────────────────────────────────

router.get('/:id/versions', checkDiagramAccess('id'), ctrl.getVersions);

router.post(
  '/:id/versions',
  authorize('DC', 'ADMIN'),
  uploadSingle('file'),
  validate(createVersionSchema, 'body'),
  ctrl.createVersion
);

router.get(
  '/:id/versions/:versionId/file',
  checkDiagramAccess('id'),
  ctrl.downloadVersionFile
);

router.get(
  '/:id/versions/:versionId/thumbnail',
  checkDiagramAccess('id'),
  ctrl.getVersionThumbnail
);

// ── Access Rules ─────────────────────────────────────────────

router.get('/:id/access', authorize('DC', 'ADMIN'), ctrl.getAccessRules);

router.post(
  '/:id/access',
  authorize('DC', 'ADMIN'),
  validate(createAccessRuleSchema, 'body'),
  ctrl.createAccessRule
);

router.delete('/:id/access/:ruleId', authorize('DC'), ctrl.deleteAccessRule);

export default router;