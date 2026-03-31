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

// All diagram routes require authentication
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════
// DIAGRAM CRUD
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/diagrams
 * DC only — create a new diagram with version 1
 * Uses multipart/form-data (file + JSON body fields)
 */
router.post(
  '/',
  authorize('DC', 'ADMIN'),
  uploadSingle('file'),
  validate(createDiagramSchema),
  ctrl.createDiagram
);

/**
 * GET /api/diagrams
 * Authenticated — list all accessible diagrams
 * ENGINEERs see only diagrams they have been granted access to
 * DC/ADMIN/MANAGER see all active diagrams
 */
router.get(
  '/',
  validate(listDiagramsQuerySchema, 'query'),
  ctrl.listDiagrams
);

/**
 * GET /api/diagrams/:id
 * Authenticated + access check
 */
router.get(
  '/:id',
  checkDiagramAccess('id'),
  ctrl.getDiagram
);

/**
 * PATCH /api/diagrams/:id
 * DC only — update title, description, tags
 */
router.patch(
  '/:id',
  authorize('DC', 'ADMIN'),
  validate(updateDiagramSchema),
  ctrl.updateDiagram
);

/**
 * DELETE /api/diagrams/:id
 * DC or ADMIN — soft-delete (isActive = false)
 */
router.delete(
  '/:id',
  authorize('DC', 'ADMIN'),
  ctrl.deleteDiagram
);

// ═══════════════════════════════════════════════════════════════
// VERSIONS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/diagrams/:id/versions
 * Authenticated + access check — list all versions
 */
router.get(
  '/:id/versions',
  checkDiagramAccess('id'),
  ctrl.getVersions
);

/**
 * POST /api/diagrams/:id/versions
 * DC only — upload a new version
 */
router.post(
  '/:id/versions',
  authorize('DC', 'ADMIN'),
  uploadSingle('file'),
  validate(createVersionSchema),
  ctrl.createVersion
);

/**
 * GET /api/diagrams/:id/versions/:versionId/file
 * Authenticated + access check — download file (supports Range header)
 */
router.get(
  '/:id/versions/:versionId/file',
  checkDiagramAccess('id'),
  ctrl.downloadVersionFile
);

/**
 * GET /api/diagrams/:id/versions/:versionId/thumbnail
 * Authenticated + access check — get thumbnail JPEG
 */
router.get(
  '/:id/versions/:versionId/thumbnail',
  checkDiagramAccess('id'),
  ctrl.getVersionThumbnail
);

// ═══════════════════════════════════════════════════════════════
// ACCESS RULES
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/diagrams/:id/access
 * DC or ADMIN — list all access rules for a diagram
 */
router.get(
  '/:id/access',
  authorize('DC', 'ADMIN'),
  ctrl.getAccessRules
);

/**
 * POST /api/diagrams/:id/access
 * DC only — add an access rule
 */
router.post(
  '/:id/access',
  authorize('DC', 'ADMIN'),
  validate(createAccessRuleSchema),
  ctrl.createAccessRule
);

/**
 * DELETE /api/diagrams/:id/access/:ruleId
 * DC only — remove an access rule
 */
router.delete(
  '/:id/access/:ruleId',
  authorize('DC', 'ADMIN'),
  ctrl.deleteAccessRule
);

export default router;