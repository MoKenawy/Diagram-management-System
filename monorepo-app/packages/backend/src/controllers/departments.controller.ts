// src/controllers/departments.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as departmentsService from '../services/departments.service';
import { logAction, getClientIp } from '../services/audit.service';

export async function getActiveDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentsService.getAllActiveDepartments();
    res.json(departments);
  } catch (err) {
    next(err);
  }
}

export async function getAllDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentsService.getAllDepartments();
    res.json(departments);
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentStats(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stats = await departmentsService.getDepartmentStats(id);

    if (!stats) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Department not found' });
      return;
    }

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = Array.isArray(req.validatedBody) ? req.validatedBody[0] : req.validatedBody;
    const exists = await departmentsService.checkDepartmentCodeExists(data.code);
    if (exists) {
      res.status(409).json({
        error: 'DEPARTMENT_CODE_EXISTS',
        message: 'A department with this code already exists',
      });
      return;
    }

    const department = await departmentsService.createDepartment(data);

    await logAction({
      userId: req.user!.id,
      action: 'DEPARTMENT_CREATED',
      targetType: 'DEPARTMENT',
      targetId: department.id,
      ipAddress: getClientIp(req),
      metadata: { nameAr: data.nameAr, nameEn: data.nameEn, code: data.code },
    });

    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = req.validatedBody;

    const existing = await departmentsService.getDepartmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Department not found' });
      return;
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await departmentsService.checkDepartmentCodeExists(data.code, id);
      if (codeExists) {
        res.status(409).json({
          error: 'DEPARTMENT_CODE_EXISTS',
          message: 'A department with this code already exists',
        });
        return;
      }

      await logAction({
        userId: req.user!.id,
        action: 'DEPARTMENT_CODE_CHANGED',
        targetType: 'DEPARTMENT',
        targetId: id,
        ipAddress: getClientIp(req),
        metadata: { oldCode: existing.code, newCode: data.code },
      });
    }

    const updated = await departmentsService.updateDepartment(id, data);

    const changedFields: string[] = [];
    if (data.nameAr && data.nameAr !== existing.nameAr) changedFields.push('nameAr');
    if (data.nameEn && data.nameEn !== existing.nameEn) changedFields.push('nameEn');
    if (data.code && data.code !== existing.code) changedFields.push('code');

    await logAction({
      userId: req.user!.id,
      action: 'DEPARTMENT_UPDATED',
      targetType: 'DEPARTMENT',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { changedFields },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ─── Deactivate Department ───────────────────────────────────────

export async function deactivateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await departmentsService.getDepartmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Department not found' });
      return;
    }

    if (!existing.isActive) {
      res.status(409).json({
        error: 'ALREADY_INACTIVE',
        message: 'Department is already deactivated',
      });
      return;
    }

    const result = await departmentsService.deactivateDepartment(id);

    if (!result.success) {
      res.status(409).json({
        error: result.error,
        message: result.message,
        count: result.count,
      });
      return;
    }

    await logAction({
      userId: req.user!.id,
      action: 'DEPARTMENT_DEACTIVATED',
      targetType: 'DEPARTMENT',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { nameAr: existing.nameAr, nameEn: existing.nameEn, code: existing.code },
    });

    res.json(result.department);
  } catch (err) {
    next(err);
  }
}

// ─── NEW: Activate Department ────────────────────────────────────

export async function activateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await departmentsService.getDepartmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Department not found' });
      return;
    }

    if (existing.isActive) {
      res.status(409).json({
        error: 'ALREADY_ACTIVE',
        message: 'Department is already active',
      });
      return;
    }

    const activated = await departmentsService.activateDepartment(id);

    await logAction({
      userId: req.user!.id,
      action: 'DEPARTMENT_ACTIVATED',
      targetType: 'DEPARTMENT',
      targetId: id,
      ipAddress: getClientIp(req),
      metadata: { nameAr: existing.nameAr, nameEn: existing.nameEn, code: existing.code },
    });

    res.json(activated);
  } catch (err) {
    next(err);
  }
}