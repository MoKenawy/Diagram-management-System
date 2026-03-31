import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { logAction } from '../utils/auditLog';
import { authenticate, } from '../middleware/authenticate'; // Assume standard auth middlewares
import { requireRole } from '../middleware/access';
import fi from 'zod/v4/locales/fi.js';
import { id } from 'zod/v4/locales/index.js';


const departmentsRouter = Router({ mergeParams: true });

const deptSchema = z.object({
  nameAr: z.string().min(2),
  nameEn: z.string().min(2),
  code: z.string().min(2).max(10).regex(/^[A-Z0-9_]+$/i)
});

departmentsRouter.get('/', authenticate, async (req, res) => {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, nameAr: true, nameEn: true, code: true }
  });
  res.json(departments);
});

departmentsRouter.get('/all', authenticate,
  requireRole('ADMIN'),
  async (req, res) => {
    const departments = await prisma.department.findMany();
    res.json(departments);
  });

departmentsRouter.get('/:id/stats', authenticate,
  requireRole('ADMIN'),
  async (req, res) => {
    const { deptId } = req.params;
    if (typeof deptId !== 'string') {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }
    const dept = await prisma.department.findUnique({ where: { id: deptId } });
    if (!dept) return res.status(404).json({ error: 'Not found' });

    const activeUserCount = await prisma.user.count({ where: { departmentId: deptId, isActive: true } });
    const totalUserCount = await prisma.user.count({ where: { departmentId: deptId } });
    const activeDiagramCount = await prisma.diagram.count({ where: { departmentId: deptId, isActive: true } });
    const totalDiagramCount = await prisma.diagram.count({ where: { departmentId: deptId } });

    res.json({ ...dept, activeUserCount, totalUserCount, activeDiagramCount, totalDiagramCount });
  });

departmentsRouter.post('/',
   authenticate,
  requireRole('ADMIN'),
  async (req, res) => {
    try {
      const data = deptSchema.parse(req.body);
      data.code = data.code.toUpperCase();

      const exists = await prisma.department.findFirst({
        where: { code: { equals: data.code, mode: 'insensitive' } }
      });

      if (exists) {
        return res.status(409).json({ error: 'DEPARTMENT_CODE_EXISTS', message: 'A department with this code already exists' });
      }

      const dept = await prisma.department.create({ data });

      const userId = req.user!.id;
      if (userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }
      await logAction({ userId, action: 'DEPARTMENT_CREATED', targetType: 'DEPARTMENT', targetId: dept.id, ipAddress: req.ip, metadata: data });

      res.status(201).json(dept);
    } catch (error) {
      res.status(400).json({ error });
    }
  });



departmentsRouter.patch('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const userId = req.user!.id;
    if (userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const data = deptSchema.partial().parse(req.body);
    if (data.code) data.code = data.code.toUpperCase();
    const { deptId } = req.params;
    if (typeof deptId !== 'string') {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }



    const current = await prisma.department.findUnique({ where: { id: deptId } });

    if (data.code && current?.code !== data.code) {
      const exists = await prisma.department.findFirst({
        where: { code: { equals: data.code, mode: 'insensitive' }, id: { not: deptId } }


      });
      if (exists) return res.status(409).json({ error: 'DEPARTMENT_CODE_EXISTS' });


      await logAction({
        userId: userId,
        action: 'DEPARTMENT_CODE_CHANGED',
        targetType: 'DEPARTMENT',
        targetId: deptId,
        ipAddress: req.ip,
        metadata: { oldCode: current?.code, newCode: data.code }
      });
    }

    const updated = await prisma.department.update({ where: { id: deptId }, data });

    await logAction({
      userId: userId,
      action: 'DEPARTMENT_UPDATED',
      targetType: 'DEPARTMENT',
      targetId: deptId,
      ipAddress: req.ip,
      metadata: { oldCode: current?.code, newCode: data.code }
    });


    res.json(updated);
  } catch (error) {
    res.status(400).json({ error });
  }
});

departmentsRouter.patch('/:id/deactivate', authenticate, requireRole('ADMIN'), async (req, res) => {

    const userId = req.user!.id;
    if (userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const data = deptSchema.partial().parse(req.body);
    if (data.code) data.code = data.code.toUpperCase();
    const { deptId } = req.params;
    if (typeof deptId !== 'string') {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }


  const activeUserCount = await prisma.user.count({ where: { departmentId: deptId, isActive: true } });
  if (activeUserCount > 0) {
    return res.status(409).json({
      error: 'DEPARTMENT_HAS_ACTIVE_USERS',
      message: `Cannot deactivate: department has ${activeUserCount} active user(s).`,
      count: activeUserCount
    });
  }

  const activeDiagramCount = await prisma.diagram.count({ where: { departmentId: deptId, isActive: true } });
  if (activeDiagramCount > 0) {
    return res.status(409).json({
      error: 'DEPARTMENT_HAS_ACTIVE_DIAGRAMS',
      message: `Cannot deactivate: department owns ${activeDiagramCount} active diagram(s).`,
      count: activeDiagramCount
    });
  }

  const updated = await prisma.department.update({ where: { id: deptId }, data: { isActive: false } });

    await logAction({
      userId: userId,
      action: 'DEPARTMENT_DEACTIVATED',
      targetType: 'DEPARTMENT',
      targetId: deptId,
      ipAddress: req.ip,
      metadata: { nameAr: updated.nameAr, nameEn: updated.nameEn, code: updated.code }
    });

  res.json(updated);
});

export default departmentsRouter;    