// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { logAction, getClientIp } from '../services/audit.service';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.getUsers(req.query as any);
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
    const data = req.body;

    // Check username uniqueness
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
    const data = req.body;

    // Verify user exists
    const existing = await usersService.getUserById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    // Guard: cannot change own role
    if (data.role && id === req.user!.id) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You cannot change your own role',
      });
      return;
    }

    const updated = await usersService.updateUser(id, data);

    // Determine changed fields for audit
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
    const { newPassword } = req.body;

    // Verify user exists
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