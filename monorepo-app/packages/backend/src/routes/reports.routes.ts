// src/routes/reports.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import { reportQuerySchema, uploadsOverTimeQuerySchema, exportQuerySchema } from '../schemas/reports.schema';
import * as ctrl from '../controllers/reports.controller';

const router = Router();

// All routes: MANAGER and ADMIN only
const auth = [authenticate, authorize('MANAGER', 'ADMIN')];

// GET /api/reports/summary
router.get('/summary', ...auth, validate(reportQuerySchema, 'query'), ctrl.getSummary);

// GET /api/reports/uploads-over-time
router.get(
  '/uploads-over-time',
  ...auth,
  validate(uploadsOverTimeQuerySchema, 'query'),
  ctrl.getUploadsOverTime
);

// GET /api/reports/downloads-by-diagram
router.get(
  '/downloads-by-diagram',
  ...auth,
  validate(reportQuerySchema, 'query'),
  ctrl.getDownloadsByDiagram
);

// GET /api/reports/access-by-department
router.get(
  '/access-by-department',
  ...auth,
  validate(reportQuerySchema, 'query'),
  ctrl.getAccessByDepartment
);

// GET /api/reports/export
router.get('/export', ...auth, validate(exportQuerySchema, 'query'), ctrl.exportReport);

export default router;