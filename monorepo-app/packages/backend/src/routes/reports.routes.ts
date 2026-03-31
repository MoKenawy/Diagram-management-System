// src/routes/reports.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import {
  reportQuerySchema,
  uploadsOverTimeQuerySchema,
  exportQuerySchema,
} from '../schemas/reports.schema';
import * as ctrl from '../controllers/reports.controller';

const router = Router();

const auth = [authenticate, authorize('MANAGER', 'ADMIN')] as const;

router.get('/summary', ...auth, validate(reportQuerySchema, 'query'), ctrl.getSummary);

router.get(
  '/uploads-over-time',
  ...auth,
  validate(uploadsOverTimeQuerySchema, 'query'),
  ctrl.getUploadsOverTime
);

router.get(
  '/downloads-by-diagram',
  ...auth,
  validate(reportQuerySchema, 'query'),
  ctrl.getDownloadsByDiagram
);

router.get(
  '/access-by-department',
  ...auth,
  validate(reportQuerySchema, 'query'),
  ctrl.getAccessByDepartment
);

router.get('/export', ...auth, validate(exportQuerySchema, 'query'), ctrl.exportReport);

export default router;