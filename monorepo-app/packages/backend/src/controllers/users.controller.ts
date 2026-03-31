// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { logAction, getClientIp } from '../services/audit.service';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = Array.isArray(req.validatedQuery) ? req.validatedQuery[0] : req.validatedQuery;
    const result = await usersService.getUsers(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getActiveEngineers(req: Request, res: Response, next: NextFunction) {
  try {
    const engineers = await usersService.getActiveEngineers();
    res.json(engineers);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = Array.isArray(req.body) ? req.body[0] : req.body;
    const exists = await usersService.checkUsernameExists(data.username);
    if (exists) {
      res.status(409).json({
        error: 'USERNAME_EXISTS',
        message: 'A user with this username already exists',
      });
      return;
    }

    const user = await usersService.createUser(data);
    await logAction({
      userId: req.user!.id,
      action: 'USER_CREATED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: getClientIp(req),
      metadata: {
        username: data.username,
        fullName: data.fullName,
        role: data.role,
        departmentId: data.departmentId || null,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = req.validatedBody;

    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    if (data.role && id === req.user!.id) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You cannot change your own role',
      });
      return;
    }

    const updated = await usersService.updateUser(id, data);

    const changedFields: string[] = [];
    if (data.fullName !== undefined && data.fullName !== existing.fullName) changedFields.push('fullName');
    if (data.email !== undefined && data.email !== existing.email) changedFields.push('email');
    if (data.role !== undefined && data.role !== existing.role) changedFields.push('role');
    if (data.departmentId !== undefined && data.departmentId !== existing.departmentId) changedFields.push('departmentId');
    if (data.isActive !== undefined && data.isActive !== existing.isActive) changedFields.push('isActive');

    await logAction({
      userId: req.user!.id,
      action: 'USER_UPDATED',
      targetType: 'USER',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { changedFields, targetUsername: existing.username },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { newPassword } = req.validatedBody;

    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    await usersService.resetPassword(id, newPassword);

    await logAction({
      userId: req.user!.id,
      action: 'PASSWORD_RESET',
      targetType: 'USER',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { targetUsername: existing.username },
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── NEW: Deactivate User ────────────────────────────────────────

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Guard: cannot deactivate yourself
    if (id === req.user!.id) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You cannot deactivate your own account',
      });
      return;
    }

    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    if (!existing.isActive) {
      res.status(409).json({
        error: 'ALREADY_INACTIVE',
        message: 'User is already deactivated',
      });
      return;
    }

    const deactivated = await usersService.deactivateUser(id);

    await logAction({
      userId: req.user!.id,
      action: 'USER_DEACTIVATED',
      targetType: 'USER',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        targetUsername: existing.username,
        targetFullName: existing.fullName,
        targetRole: existing.role,
      },
    });

    res.json(deactivated);
  } catch (err) {
    next(err);
  }
}

// ─── NEW: Activate User ─────────────────────────────────────────

export async function activateUser(req: Request, res: Response, next: NextFunction) {
  try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    if (existing.isActive) {
      res.status(409).json({
        error: 'ALREADY_ACTIVE',
        message: 'User is already active',
      });
      return;
    }

    const activated = await usersService.activateUser(id);

    await logAction({
      userId: req.user!.id,
      action: 'USER_ACTIVATED',
      targetType: 'USER',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        targetUsername: existing.username,
        targetFullName: existing.fullName,
        targetRole: existing.role,
      },
    });

    res.json(activated);
  } catch (err) {
    next(err);
  }
}

// ─── NEW: Delete User (hard delete) ─────────────────────────────

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { confirmUsername } = req.validatedBody;

    // Guard: cannot delete yourself
    if (id === req.user!.id) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You cannot delete your own account',
      });
      return;
    }

    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    // Guard: confirm username must match
    if (confirmUsername !== existing.username) {
      res.status(400).json({
        error: 'USERNAME_MISMATCH',
        message: `Confirmation username does not match. Expected "${existing.username}"`,
      });
      return;
    }

    const result = await usersService.deleteUser(id);

    if (!result.success) {
      res.status(409).json({
        error: result.error,
        message: result.message,
      });
      return;
    }

    await logAction({
      userId: req.user!.id,
      action: 'USER_DELETED',
      targetType: 'USER',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: {
        deletedUsername: existing.username,
        deletedFullName: existing.fullName,
        deletedRole: existing.role,
        deletedDepartmentId: existing.departmentId,
      },
    });

    res.json({
      message: 'User has been permanently deleted',
      deletedUser: {
        id: existing.id,
        username: existing.username,
        fullName: existing.fullName,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── NEW: Get User Deletion Impact ──────────────────────────────

export async function getUserDeletionImpact(req: Request, res: Response, next: NextFunction) {
  try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    const impact = await usersService.getUserDeletionImpact(id);

    res.json({
      user: {
        id: existing.id,
        username: existing.username,
        fullName: existing.fullName,
        role: existing.role,
        isActive: existing.isActive,
      },
      impact: {
        ...impact,
        canDelete: !impact.hasReferences,
        recommendation: impact.hasReferences
          ? 'This user has existing references. Use deactivation instead of deletion.'
          : 'This user can be safely deleted.',
      },
    });
  } catch (err) {
    next(err);
  }
}