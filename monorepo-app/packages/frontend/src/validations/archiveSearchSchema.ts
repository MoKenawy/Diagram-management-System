// src/schemas/archiveSearchSchema.ts
import { z } from 'zod';
import { FileFormat } from '@/types/index'; // Import the enum

export const archiveSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  page: z.number().int().positive().optional().catch(1),
  limit: z.number().int().positive().max(100).optional().catch(20),
  fileFormat: z
    .enum([FileFormat.PDF, FileFormat.DWG, FileFormat.JPEG, FileFormat.PNG, FileFormat.SVG]) // Use FileFormat enum members
    .array()
    .optional()
    .catch(undefined),
  departmentId: z.string().array().optional().catch(undefined),
  uploadedFrom: z.string().optional().catch(undefined),
  uploadedTo: z.string().optional().catch(undefined),
  view: z.enum(['grid', 'table']).optional().catch('grid'),
});

export type ArchiveSearchParams = z.infer<typeof archiveSearchSchema>;