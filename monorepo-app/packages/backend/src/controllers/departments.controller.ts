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
    const data = req.body;

    // Check code uniqueness
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
    const data = req.body;

    // Verify department exists
    const existing = await departmentsService.getDepartmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Department not found' });
      return;
    }

    // If code is being changed, check uniqueness excluding current ID
    if (data.code && data.code !== existing.code) {
      const codeExists = await departmentsService.checkDepartmentCodeExists(data.code, id);
      if (codeExists) {
        res.status(409).json({
          error: 'DEPARTMENT_CODE_EXISTS',
          message: 'A department with this code already exists',
        });
        return;
      }

      // Log code change specifically
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

    // Determine changed fields
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

export async function deactivateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Verify department exists
    const existing = await departmentsService.getDepartmentById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Department not found' });
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