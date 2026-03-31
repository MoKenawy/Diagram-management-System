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
  deleteUserSchema,
} from '../schemas/users.schema';
import * as ctrl from '../controllers/users.controller';

const router = Router();

// List users (paginated)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(usersQuerySchema, 'query'),
  ctrl.getUsers
);

// Active engineers (for DC selectors)
router.get(
  '/engineers',
  authenticate,
  authorize('DC', 'ADMIN'),
  ctrl.getActiveEngineers
);

// Create user
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createUserSchema, 'body'),
  ctrl.createUser
);

// Update user
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateUserSchema, 'body'),
  ctrl.updateUser
);

// Reset password
router.patch(
  '/:id/password',
  authenticate,
  authorize('ADMIN'),
  validate(resetPasswordSchema, 'body'),
  ctrl.resetPassword
);

// Deactivate user
router.patch(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  ctrl.deactivateUser
);

// Activate user
router.patch(
  '/:id/activate',
  authenticate,
  authorize('ADMIN'),
  ctrl.activateUser
);

// Get deletion impact (check before deleting)
router.get(
  '/:id/deletion-impact',
  authenticate,
  authorize('ADMIN'),
  ctrl.getUserDeletionImpact
);

// Delete user (hard delete — requires username confirmation)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(deleteUserSchema, 'body'),
  ctrl.deleteUser
);

export default router;