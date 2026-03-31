// src/routes/users.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  usersQuerySchema,
} from '../schemas/users.schema';
import * as ctrl from '../controllers/users.controller';

const router = Router();

// GET /api/users — Admin only, paginated list
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(usersQuerySchema, 'query'),
  ctrl.getUsers
);

// GET /api/users/engineers — DC role, active engineers for access selector
router.get(
  '/engineers',
  authenticate,
  authorize('DC', 'ADMIN'),
  ctrl.getActiveEngineers
);

// POST /api/users — Admin only
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createUserSchema),
  ctrl.createUser
);

// PATCH /api/users/:id — Admin only
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateUserSchema),
  ctrl.updateUser
);

// PATCH /api/users/:id/password — Admin only
router.patch(
  '/:id/password',
  authenticate,
  authorize('ADMIN'),
  validate(resetPasswordSchema),
  ctrl.resetPassword
);

export default router;