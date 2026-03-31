// src/routes/departments.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import { createDepartmentSchema, updateDepartmentSchema } from '../schemas/departments.schema';
import * as ctrl from '../controllers/departments.controller';

const router = Router();

// GET /api/departments — all authenticated users, active departments only
router.get('/', authenticate, ctrl.getActiveDepartments);

// GET /api/departments/all — Admin only, all departments
router.get('/all', authenticate, authorize('ADMIN'), ctrl.getAllDepartments);

// GET /api/departments/:id/stats — Admin only
router.get('/:id/stats', authenticate, authorize('ADMIN'), ctrl.getDepartmentStats);

// POST /api/departments — Admin only
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createDepartmentSchema),
  ctrl.createDepartment
);

// PATCH /api/departments/:id — Admin only
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateDepartmentSchema),
  ctrl.updateDepartment
);

// PATCH /api/departments/:id/deactivate — Admin only
router.patch(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  ctrl.deactivateDepartment
);

export default router;