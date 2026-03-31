// import { Request, Response, NextFunction } from 'express';
// import { Router } from 'express';

// import { z } from 'zod';
// import path from 'path';
// import fs from 'fs';
// import mime from 'mime-types';
// import { FileFormat, Prisma } from '@prisma/client';
// import { prisma } from '../lib/prisma';
// import { upload, validateFileSize, extToFileFormat } from '../utils/storage';
// import { enqueueThumbnailJob } from '../queues/thumbnail.queue';
// import { logAction } from '../utils/auditLog';
// import {
//   checkDiagramAccess,
//   requireRole,
//   getAccessibleDiagramIds,
// } from '../middleware/access';
// import { authenticate } from '../middleware/authenticate';



// const diagramsRouter = Router({ mergeParams: true });

// // ─── Zod Schemas ─────────────────────────────────────────

// const createDiagramSchema = z.object({
//   title: z.string().min(1).max(255),
//   description: z.string().optional(),
//   departmentId: z.string().min(1),
//   tags: z.string().optional(), // comma-separated
//   revisionLabel: z.string().min(1).max(100),
//   changeSummary: z.string().min(1),
// });

// const updateDiagramSchema = z.object({
//   title: z.string().min(1).max(255).optional(),
//   description: z.string().optional(),
//   tags: z.string().optional(), // comma-separated; replaces all existing
// });

// const createVersionSchema = z.object({
//   revisionLabel: z.string().min(1).max(100),
//   changeSummary: z.string().min(1),
// });

// const createAccessSchema = z.object({
//   targetType: z.enum(['USER', 'DEPARTMENT']),
//   targetId: z.string().min(1),
//   accessLevel: z.enum(['VIEW', 'EDIT', 'ADMIN']),
//   policy: z.enum(['ALLOW', 'DENY']),
// });

// const listDiagramsSchema = z.object({
//   search: z.string().optional(),
//   fileFormat: z.enum(['PDF', 'JPEG', 'PNG', 'SVG', 'DWG']).optional(),
//   departmentId: z.string().optional(),
//   uploadedFrom: z.string().optional(),
//   uploadedTo: z.string().optional(),
//   page: z.coerce.number().int().min(1).default(1),
//   limit: z.coerce.number().int().min(1).max(100).default(20),
// });

// // ─── Helper: get client IP ──────────────────────────────

// function getClientIp(req: Request): string {
//   return (
//     (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
//     req.socket.remoteAddress ||
//     'unknown'
//   );
// }

// // ─── Multer error handler ───────────────────────────────

// function handleMulterError(err: any, req: Request, res: Response, next: NextFunction): void {
//   if (err) {
//     // Clean up file if it was uploaded
//     if (req.file) {
//       try {
//         fs.unlinkSync(req.file.path);
//       } catch {
//         // ignore
//       }
//     }

//     if (err.message && err.message.includes('File type')) {
//       res.status(400).json({ error: err.message });
//       return;
//     }

//     if (err.code === 'LIMIT_FILE_SIZE') {
//       res.status(400).json({ error: 'File exceeds maximum upload size' });
//       return;
//     }

//     res.status(400).json({ error: err.message || 'Upload error' });
//     return;
//   }
//   next();
// }

// // ─── POST /api/diagrams ─────────────────────────────────

// diagramsRouter.post(
//   '/',
//   authenticate,
//   requireRole('ADMIN'),
//   upload.single('file'),
//   handleMulterError,
//   validateFileSize as any,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;

//       if (!req.file) {
//         res.status(400).json({ error: 'File is required' });
//         return;
//       }

//       const parsed = createDiagramSchema.safeParse(req.body);
//       if (!parsed.success) {
//         // Cleanup uploaded file on validation failure
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch {
//           // ignore
//         }
//         res.status(400).json({ error: 'Validation error', details: parsed.error.flatten() });
//         return;
//       }

//       const { title, description, departmentId, tags, revisionLabel, changeSummary } = parsed.data;

//       // Verify department exists
//       const department = await prisma.department.findUnique({
//         where: { id: departmentId },
//       });

//       if (!department) {
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch {
//           // ignore
//         }
//         res.status(400).json({ error: 'Department not found' });
//         return;
//       }

//       const ext = path.extname(req.file.originalname).toLowerCase();
//       const fileFormat = extToFileFormat(ext) as FileFormat;

//       // Transaction
//       const result = await prisma.$transaction(async (tx) => {
//         // 1. INSERT diagram
//         const diagram = await tx.diagram.create({
//           data: {
//             title,
//             description: description || null,
//             departmentId,
//             isActive: true,
//           },
//         });

//         // 2. INSERT diagram_version
//         const version = await tx.diagramVersion.create({
//           data: {
//             diagramId: diagram.id,
//             versionNumber: 1,
//             revisionLabel,
//             changeSummary,
//             filePath: req.file!.path,
//             originalFilename: req.file!.originalname,
//             fileFormat,
//             fileSizeBytes: BigInt(req.file!.size),
//             uploadedById: user.id,
//           },
//         });

//         // 3. UPDATE diagram SET currentVersionId
//         await tx.diagram.update({
//           where: { id: diagram.id },
//           data: { currentVersionId: version.id },
//         });

//         // 4. INSERT tags
//         if (tags && tags.trim().length > 0) {
//           const tagList = tags
//             .split(',')
//             .map((t: string) => t.trim())
//             .filter((t: string) => t.length > 0);

//           if (tagList.length > 0) {
//             await tx.diagramTag.createMany({
//               data: tagList.map((tag: string) => ({
//                 diagramId: diagram.id,
//                 tag,
//               })),
//             });
//           }
//         }

//         // 5. Audit log
//         await tx.auditLog.create({
//           data: {
//             userId: user.id,
//             action: 'DIAGRAM_CREATED',
//             targetType: 'DIAGRAM',
//             targetId: diagram.id,
//             ipAddress: getClientIp(req),
//             metadata: {
//               title,
//               departmentId,
//               versionNumber: 1,
//               revisionLabel,
//               fileFormat,
//               fileSizeBytes: req.file!.size,
//             },
//           },
//         });

//         return { diagram, version };
//       });

//       // Enqueue thumbnail job (outside transaction)
//       try {
//         await enqueueThumbnailJob({
//           versionId: result.version.id,
//           filePath: req.file.path,
//           fileFormat,
//         });
//       } catch (err) {
//         console.error('Failed to enqueue thumbnail job:', err);
//       }

//       // Serialize BigInt
//       const versionResponse = {
//         ...result.version,
//         fileSizeBytes: result.version.fileSizeBytes.toString(),
//       };

//       res.status(201).json({
//         diagram: result.diagram,
//         version: versionResponse,
//       });
//     } catch (error) {
//       // Cleanup file on error
//       if (req.file) {
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch {
//           // ignore
//         }
//       }
//       next(error);
//     }
//   }
// );

// // ─── GET /api/diagrams ──────────────────────────────────

// diagramsRouter.get(
//   '/',
//   authenticate,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const queryParsed = listDiagramsSchema.safeParse(req.query);
//       if (!queryParsed.success) {
//         res.status(400).json({ error: 'Invalid query parameters', details: queryParsed.error.flatten() });
//         return;
//       }

//       const { search, fileFormat, departmentId, uploadedFrom, uploadedTo, page, limit } =
//         queryParsed.data;

//       // Build WHERE conditions
//       const where: Prisma.DiagramWhereInput = {
//         isActive: true,
//       };

//       // Role-based filtering
//       if (user.role === 'ENGINEER') {
//         const accessibleIds = await getAccessibleDiagramIds(
//           user.id,
//           user.departmentId || null
//         );

//         // Also include diagrams from the engineer's own department (unless denied)
//         if (user.departmentId) {
//           const deptDiagrams = await prisma.diagram.findMany({
//             where: {
//               departmentId: user.departmentId,
//               isActive: true,
//             },
//             select: { id: true },
//           });

//           const deptDiagramIds = deptDiagrams.map((d) => d.id);

//           // Check for deny rules on department diagrams
//           const denyRules = await prisma.diagramAccess.findMany({
//             where: {
//               diagramId: { in: deptDiagramIds },
//               OR: [
//                 { targetType: 'USER', targetId: user.id, policy: 'DENY' },
//                 {
//                   targetType: 'DEPARTMENT',
//                   targetId: user.departmentId,
//                   policy: 'DENY',
//                 },
//               ],
//             },
//             select: { diagramId: true },
//           });

//           const deniedIds = new Set(denyRules.map((r) => r.diagramId));
//           const allowedDeptIds = deptDiagramIds.filter((id) => !deniedIds.has(id));

//           const allAccessibleIds = [
//             ...new Set([...accessibleIds, ...allowedDeptIds]),
//           ];

//           where.id = { in: allAccessibleIds };
//         } else {
//           where.id = { in: accessibleIds };
//         }
//       }
//       // DC, ADMIN, MANAGER see all active diagrams (no additional ID filter needed)

//       if (departmentId) {
//         where.departmentId = departmentId;
//       }

//       // Search: title ILIKE or tag match
//       if (search) {
//         const matchingTagDiagramIds = await prisma.diagramTag.findMany({
//           where: {
//             tag: { contains: search, mode: 'insensitive' },
//           },
//           select: { diagramId: true },
//           distinct: ['diagramId'],
//         });

//         const tagDiagramIds = matchingTagDiagramIds.map((t) => t.diagramId);

//         where.OR = [
//           { title: { contains: search, mode: 'insensitive' } },
//           { id: { in: tagDiagramIds } },
//         ];
//       }

//       // File format and date filtering need to be on the version; we'll filter via a subquery approach
//       // We'll use a raw-ish approach: find diagrams that have a current version matching the filters
//       let versionFilter: Prisma.DiagramVersionWhereInput | undefined;

//       if (fileFormat || uploadedFrom || uploadedTo) {
//         versionFilter = {};
//         if (fileFormat) {
//           versionFilter.fileFormat = fileFormat as FileFormat;
//         }
//         if (uploadedFrom) {
//           versionFilter.uploadedAt = {
//             ...((versionFilter.uploadedAt as any) || {}),
//             gte: new Date(uploadedFrom),
//           };
//         }
//         if (uploadedTo) {
//           versionFilter.uploadedAt = {
//             ...((versionFilter.uploadedAt as any) || {}),
//             lte: new Date(uploadedTo),
//           };
//         }
//       }

//       // If we have version filters, first find matching version IDs, then filter diagrams
//       if (versionFilter) {
//         const matchingVersions = await prisma.diagramVersion.findMany({
//           where: versionFilter,
//           select: { id: true },
//           distinct: ['id'],
//         });

//         const matchingVersionIds = matchingVersions.map((v) => v.id);
//         where.currentVersionId = { in: matchingVersionIds };
//       }

//       const skip = (page - 1) * limit;

//       const [diagrams, total] = await Promise.all([
//         prisma.diagram.findMany({
//           where,
//           skip,
//           take: limit,
//           orderBy: { updatedAt: 'desc' },
//           include: {
//             department: {
//               select: { id: true, nameAr: true, nameEn: true, code: true },
//             },
//             tags: {
//               select: { id: true, tag: true },
//             },
//           },
//         }),
//         prisma.diagram.count({ where }),
//       ]);

//       // Fetch current versions for the returned diagrams
//       const currentVersionIds = diagrams
//         .map((d) => d.currentVersionId)
//         .filter((id): id is string => id !== null);

//       const versions = currentVersionIds.length > 0
//         ? await prisma.diagramVersion.findMany({
//           where: { id: { in: currentVersionIds } },
//           select: {
//             id: true,
//             diagramId: true,
//             versionNumber: true,
//             revisionLabel: true,
//             fileFormat: true,
//             fileSizeBytes: true,
//             thumbnailPath: true,
//             uploadedAt: true,
//             originalFilename: true,
//             uploadedBy: {
//               select: { id: true, fullName: true, username: true },
//             },
//           },
//         })
//         : [];

//       const versionMap = new Map(versions.map((v) => [v.diagramId, v]));

//       const data = diagrams.map((diagram) => {
//         const currentVersion = versionMap.get(diagram.id);
//         return {
//           id: diagram.id,
//           title: diagram.title,
//           description: diagram.description,
//           departmentId: diagram.departmentId,
//           department: diagram.department,
//           currentVersionId: diagram.currentVersionId,
//           isActive: diagram.isActive,
//           createdAt: diagram.createdAt,
//           updatedAt: diagram.updatedAt,
//           tags: diagram.tags.map((t) => t.tag),
//           currentVersion: currentVersion
//             ? {
//               ...currentVersion,
//               fileSizeBytes: currentVersion.fileSizeBytes.toString(),
//             }
//             : null,
//         };
//       });

//       res.json({ data, total, page, limit });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── GET /api/diagrams/:id ──────────────────────────────

// diagramsRouter.get(
//   '/:id',
//   authenticate,
//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const diagram = (req as any).diagram;

//       // Get current version
//       let currentVersion = null;
//       if (diagram.currentVersionId) {
//         currentVersion = await prisma.diagramVersion.findUnique({
//           where: { id: diagram.currentVersionId },
//           include: {
//             uploadedBy: {
//               select: { id: true, fullName: true, username: true },
//             },
//           },
//         });
//       }

//       // Get tags
//       const tags = await prisma.diagramTag.findMany({
//         where: { diagramId: diagram.id },
//         select: { id: true, tag: true },
//       });

//       // Get version count
//       const versionCount = await prisma.diagramVersion.count({
//         where: { diagramId: diagram.id },
//       });

//       // Get department
//       const department = await prisma.department.findUnique({
//         where: { id: diagram.departmentId },
//         select: { id: true, nameAr: true, nameEn: true, code: true },
//       });

//       res.json({
//         ...diagram,
//         department,
//         currentVersion: currentVersion
//           ? {
//             ...currentVersion,
//             fileSizeBytes: currentVersion.fileSizeBytes.toString(),
//           }
//           : null,
//         tags: tags.map((t) => t.tag),
//         tagRecords: tags,
//         versionCount,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── PATCH /api/diagrams/:id ────────────────────────────

// diagramsRouter.patch(
//   '/:id',
//   authenticate,

//   requireRole('DC'),
//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const diagramId = req.params.id;
//       if (typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       const parsed = updateDiagramSchema.safeParse(req.body);
//       if (!parsed.success) {
//         res.status(400).json({ error: 'Validation error', details: parsed.error.flatten() });
//         return;
//       }

//       const { title, description, tags } = parsed.data;

//       await prisma.$transaction(async (tx) => {
//         // Update diagram fields
//         const updateData: any = {};
//         if (title !== undefined) updateData.title = title;
//         if (description !== undefined) updateData.description = description;
//         diagramId
//         if (Object.keys(updateData).length > 0) {
//           await tx.diagram.update({
//             where: { id: diagramId },
//             data: updateData,
//           });
//         }

//         // Replace tags if provided
//         if (tags !== undefined) {
//           // Delete existing tags
//           await tx.diagramTag.deleteMany({
//             where: { diagramId },
//           });

//           // Insert new tags
//           if (tags.trim().length > 0) {
//             const tagList = tags
//               .split(',')
//               .map((t) => t.trim())
//               .filter((t) => t.length > 0);

//             if (tagList.length > 0) {
//               await tx.diagramTag.createMany({
//                 data: tagList.map((tag) => ({
//                   diagramId,
//                   tag,
//                 })),
//               });
//             }
//           }
//         }

//         // Audit log
//         await tx.auditLog.create({
//           data: {
//             userId: user.id,
//             action: 'DIAGRAM_UPDATED',
//             targetType: 'DIAGRAM',
//             targetId: diagramId,
//             ipAddress: getClientIp(req),
//             metadata: { title, description, tags },
//           },
//         });
//       });

//       const updatedDiagram = await prisma.diagram.findUnique({
//         where: { id: diagramId },
//         include: {
//           tags: { select: { id: true, tag: true } },
//           department: { select: { id: true, nameAr: true, nameEn: true, code: true } },
//         },
//       });

//       res.json(updatedDiagram);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── DELETE /api/diagrams/:id ───────────────────────────

// diagramsRouter.delete(
//   '/:id',
//   authenticate,
//   requireRole('DC', 'ADMIN'),
//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const diagramId = req.params.id;
//       if (typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       await prisma.diagram.update({
//         where: { id: diagramId },
//         data: { isActive: false },
//       });

//       await logAction({
//         userId: user.id,
//         action: 'DIAGRAM_DEACTIVATED',
//         targetType: 'DIAGRAM',
//         targetId: diagramId,
//         ipAddress: getClientIp(req),
//         metadata: {},
//       });

//       res.json({ message: 'Diagram deactivated successfully' });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ═══════════════════════════════════════════════════════════
// // VERSION ROUTES
// // ═══════════════════════════════════════════════════════════

// // ─── GET /api/diagrams/:id/versions ─────────────────────

// diagramsRouter.get(
//   '/:id/versions',
//   authenticate,

//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const diagramId = req.params.id;
//       if (typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       const versions = await prisma.diagramVersion.findMany({
//         where: { diagramId },
//         orderBy: { versionNumber: 'asc' },
//         include: {
//           uploadedBy: {
//             select: { id: true, fullName: true, username: true },
//           },
//         },
//       });

//       const serialized = versions.map((v) => ({
//         ...v,
//         fileSizeBytes: v.fileSizeBytes.toString(),
//       }));

//       res.json(serialized);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── POST /api/diagrams/:id/versions ────────────────────

// diagramsRouter.post(
//   '/:id/versions',
//   authenticate,

//   requireRole('DC'),
//   checkDiagramAccess(),
//   upload.single('file'),
//   handleMulterError,
//   validateFileSize as any,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const diagramId = req.params.id;
//       if (typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       if (!req.file) {
//         res.status(400).json({ error: 'File is required' });
//         return;
//       }

//       const parsed = createVersionSchema.safeParse(req.body);
//       if (!parsed.success) {
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch {
//           // ignore
//         }
//         res.status(400).json({ error: 'Validation error', details: parsed.error.flatten() });
//         return;
//       }

//       const { revisionLabel, changeSummary } = parsed.data;
//       const ext = path.extname(req.file.originalname).toLowerCase();
//       const fileFormat = extToFileFormat(ext) as FileFormat;

//       // Get max version number
//       const maxVersion = await prisma.diagramVersion.aggregate({
//         where: { diagramId },
//         _max: { versionNumber: true },
//       });

//       const nextVersionNumber = (maxVersion._max.versionNumber || 0) + 1;

//       const result = await prisma.$transaction(async (tx) => {
//         // 1. INSERT version
//         const version = await tx.diagramVersion.create({
//           data: {
//             diagramId,
//             versionNumber: nextVersionNumber,
//             revisionLabel,
//             changeSummary,
//             filePath: req.file!.path,
//             originalFilename: req.file!.originalname,
//             fileFormat,
//             fileSizeBytes: BigInt(req.file!.size),
//             uploadedById: user.id,
//           },
//         });

//         // 2. UPDATE diagram
//         await tx.diagram.update({
//           where: { id: diagramId },
//           data: { currentVersionId: version.id },
//         });

//         // 3. Audit log
//         await tx.auditLog.create({
//           data: {
//             userId: user.id,
//             action: 'VERSION_UPLOADED',
//             targetType: 'DIAGRAM',
//             targetId: diagramId,
//             ipAddress: getClientIp(req),
//             metadata: {
//               versionId: version.id,
//               versionNumber: nextVersionNumber,
//               revisionLabel,
//               fileFormat,
//               fileSizeBytes: req.file!.size,
//             },
//           },
//         });

//         return version;
//       });

//       // Enqueue thumbnail
//       try {
//         await enqueueThumbnailJob({
//           versionId: result.id,
//           filePath: req.file.path,
//           fileFormat,
//         });
//       } catch (err) {
//         console.error('Failed to enqueue thumbnail job:', err);
//       }

//       res.status(201).json({
//         ...result,
//         fileSizeBytes: result.fileSizeBytes.toString(),
//       });
//     } catch (error) {
//       if (req.file) {
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch {
//           // ignore
//         }
//       }
//       next(error);
//     }
//   }
// );

// // ─── GET /api/diagrams/:id/versions/:versionId/file ────

// diagramsRouter.get(
//   '/:id/versions/:versionId/file',
//   authenticate,

//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const { id: diagramId, versionId } = req.params;

//       if (typeof versionId !== 'string' || typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }

//       const version = await prisma.diagramVersion.findFirst({
//         where: {
//           id: versionId,
//           diagramId,
//         },
//       });

//       if (!version) {
//         res.status(404).json({ error: 'Version not found' });
//         return;
//       }

//       const filePath = version.filePath;

//       if (!fs.existsSync(filePath)) {
//         res.status(404).json({ error: 'File not found on disk' });
//         return;
//       }

//       const stat = fs.statSync(filePath);
//       const fileSize = stat.size;
//       const mimeType =
//         mime.lookup(filePath) || 'application/octet-stream';

//       // Log download
//       logAction({
//         userId: user?.id,
//         action: 'DIAGRAM_DOWNLOADED',
//         targetType: 'DIAGRAM',
//         targetId: diagramId,
//         ipAddress: getClientIp(req),
//         metadata: {
//           versionId: version.id,
//           versionNumber: version.versionNumber,
//         },
//       }).catch(() => { });

//       // Support Range header for partial content
//       const range = req.headers.range;
//       if (range) {
//         const parts = range.replace(/bytes=/, '').split('-');
//         const start = parseInt(parts[0], 10);
//         const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

//         if (start >= fileSize || end >= fileSize || start > end) {
//           res.status(416).set({
//             'Content-Range': `bytes */${fileSize}`,
//           }).end();
//           return;
//         }

//         const chunkSize = end - start + 1;

//         res.status(206).set({
//           'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//           'Accept-Ranges': 'bytes',
//           'Content-Length': chunkSize.toString(),
//           'Content-Type': mimeType,
//           'Content-Disposition': `inline; filename="${version.originalFilename}"`,
//         });

//         const stream = fs.createReadStream(filePath, { start, end });
//         stream.pipe(res);
//       } else {
//         res.set({
//           'Content-Length': fileSize.toString(),
//           'Content-Type': mimeType,
//           'Accept-Ranges': 'bytes',
//           'Content-Disposition': `inline; filename="${version.originalFilename}"`,
//         });

//         const stream = fs.createReadStream(filePath);
//         stream.pipe(res);
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── GET /api/diagrams/:id/versions/:versionId/thumbnail

// diagramsRouter.get(
//   '/:id/versions/:versionId/thumbnail',
//   authenticate,

//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const { id: diagramId, versionId } = req.params;
//       if (typeof diagramId !== 'string' || typeof versionId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       const version = await prisma.diagramVersion.findFirst({
//         where: {
//           id: versionId,
//           diagramId,
//         },
//         select: { thumbnailPath: true },
//       });

//       if (!version) {
//         res.status(404).json({ error: 'Version not found' });
//         return;
//       }

//       if (!version.thumbnailPath) {
//         res.status(404).json({ error: 'Thumbnail not available' });
//         return;
//       }

//       if (!fs.existsSync(version.thumbnailPath)) {
//         res.status(404).json({ error: 'Thumbnail file not found on disk' });
//         return;
//       }

//       res.set({
//         'Content-Type': 'image/jpeg',
//         'Cache-Control': 'public, max-age=86400',
//       });

//       const stream = fs.createReadStream(version.thumbnailPath);
//       stream.pipe(res);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ═══════════════════════════════════════════════════════════
// // ACCESS ROUTES
// // ═══════════════════════════════════════════════════════════

// // ─── GET /api/diagrams/:id/access ───────────────────────

// diagramsRouter.get(
//   '/:id/access',
//   authenticate,

//   requireRole('DC', 'ADMIN'),
//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const diagramId = req.params.id;
//       if (typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       const accessRules = await prisma.diagramAccess.findMany({
//         where: { diagramId },
//         include: {
//           grantedBy: {
//             select: { id: true, fullName: true, username: true },
//           },
//         },
//         orderBy: { grantedAt: 'desc' },
//       });

//       // Enrich with target names
//       const enrichedRules = await Promise.all(
//         accessRules.map(async (rule) => {
//           let targetName: string | null = null;

//           if (rule.targetType === 'USER') {
//             const targetUser = await prisma.user.findUnique({
//               where: { id: rule.targetId },
//               select: { fullName: true, username: true },
//             });
//             targetName = targetUser
//               ? `${targetUser.fullName} (${targetUser.username})`
//               : null;
//           } else if (rule.targetType === 'DEPARTMENT') {
//             const dept = await prisma.department.findUnique({
//               where: { id: rule.targetId },
//               select: { nameEn: true, nameAr: true, code: true },
//             });
//             targetName = dept ? `${dept.nameEn} (${dept.code})` : null;
//           }

//           return {
//             ...rule,
//             targetName,
//           };
//         })
//       );

//       res.json(enrichedRules);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── POST /api/diagrams/:id/access ─────────────────────

// diagramsRouter.post(
//   '/:id/access',
//   authenticate,

//   requireRole('DC'),
//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const diagramId = req.params.id;
//       if (typeof diagramId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       const parsed = createAccessSchema.safeParse(req.body);
//       if (!parsed.success) {
//         res.status(400).json({ error: 'Validation error', details: parsed.error.flatten() });
//         return;
//       }

//       const { targetType, targetId, accessLevel, policy } = parsed.data;

//       // Check for duplicate
//       const existing = await prisma.diagramAccess.findFirst({
//         where: {
//           diagramId,
//           targetType,
//           targetId,
//           policy,
//         },
//       });

//       if (existing) {
//         res.status(409).json({
//           error: 'An access rule with the same target and policy already exists for this diagram',
//         });
//         return;
//       }

//       // Validate target exists
//       if (targetType === 'USER') {
//         const targetUser = await prisma.user.findUnique({
//           where: { id: targetId },
//         });
//         if (!targetUser) {
//           res.status(400).json({ error: 'Target user not found' });
//           return;
//         }
//       } else if (targetType === 'DEPARTMENT') {
//         const dept = await prisma.department.findUnique({
//           where: { id: targetId },
//         });
//         if (!dept) {
//           res.status(400).json({ error: 'Target department not found' });
//           return;
//         }
//       }

//       const accessRule = await prisma.diagramAccess.create({
//         data: {
//           diagramId,
//           targetType,
//           targetId,
//           accessLevel,
//           policy,
//           grantedById: user.id,
//         },
//       });

//       await logAction({
//         userId: user.id,
//         action: 'ACCESS_RULE_ADDED',
//         targetType: 'DIAGRAM',
//         targetId: diagramId,
//         ipAddress: getClientIp(req),
//         metadata: {
//           ruleId: accessRule.id,
//           targetType,
//           targetId,
//           accessLevel,
//           policy,
//         },
//       });

//       res.status(201).json(accessRule);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // ─── DELETE /api/diagrams/:id/access/:ruleId ────────────

// diagramsRouter.delete(
//   '/:id/access/:ruleId',
//   authenticate,

//   requireRole('DC'),
//   checkDiagramAccess(),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = (req as any).user;
//       const { id: diagramId, ruleId } = req.params;
//       if (typeof diagramId !== 'string' || typeof ruleId !== 'string') {
//         res.status(400).json({ error: 'Invalid ID format' });
//         return;
//       }
//       const rule = await prisma.diagramAccess.findFirst({
//         where: {
//           id: ruleId,
//           diagramId,
//         },
//       });

//       if (!rule) {
//         res.status(404).json({ error: 'Access rule not found' });
//         return;
//       }

//       await prisma.diagramAccess.delete({
//         where: { id: ruleId },
//       });

//       await logAction({
//         userId: user.id,
//         action: 'ACCESS_RULE_REMOVED',
//         targetType: 'DIAGRAM',
//         targetId: diagramId,
//         ipAddress: getClientIp(req),
//         metadata: {
//           ruleId,
//           targetType: rule.targetType,
//           targetId: rule.targetId,
//           accessLevel: rule.accessLevel,
//           policy: rule.policy,
//         },
//       });

//       res.json({ message: 'Access rule removed successfully' });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// export default diagramsRouter;