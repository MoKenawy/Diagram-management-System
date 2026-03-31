// src/routes/departments.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import { createDepartmentSchema, updateDepartmentSchema } from '../schemas/departments.schema';
import * as ctrl from '../controllers/departments.controller';

const router = Router();

// Active departments (all authenticated users)
router.get('/', authenticate, ctrl.getActiveDepartments);

// All departments including inactive (Admin only)
router.get('/all', authenticate, authorize('ADMIN'), ctrl.getAllDepartments);

// Department stats (Admin only)
router.get('/:id/stats', authenticate, authorize('ADMIN'), ctrl.getDepartmentStats);

// Create department
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createDepartmentSchema, 'body'),
  ctrl.createDepartment
);

// Update department
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateDepartmentSchema, 'body'),
  ctrl.updateDepartment
);

// Deactivate department
router.patch(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  ctrl.deactivateDepartment
);

// Activate department
router.patch(
  '/:id/activate',
  authenticate,
  authorize('ADMIN'),
  ctrl.activateDepartment
);

export default router;