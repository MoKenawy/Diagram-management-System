// src/schemas/diagrams.schema.ts
import { z } from 'zod';

// ─── Create Diagram (with first version) ────────────────────────
export const createDiagramSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional().nullable(),
  departmentId: z.string().min(1, 'Department is required'),
  tags: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return [];
      return val
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }),
  revisionLabel: z.string().min(1, 'Revision label is required').max(50),
  changeSummary: z.string().min(1, 'Change summary is required').max(2000),
});

// ─── Update Diagram metadata ────────────────────────────────────
export const updateDiagramSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  tags: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (!val) return [];
      return val
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }),
});

// ─── Create Version ─────────────────────────────────────────────
export const createVersionSchema = z.object({
  revisionLabel: z.string().min(1, 'Revision label is required').max(50),
  changeSummary: z.string().min(1, 'Change summary is required').max(2000),
});

// ─── List Diagrams query ────────────────────────────────────────
export const listDiagramsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  fileFormat: z.enum(['PDF', 'JPEG', 'PNG', 'SVG', 'DWG']).optional(),
  departmentId: z.string().optional(),
  uploadedFrom: z.string().datetime({ offset: true }).optional(),
  uploadedTo: z.string().datetime({ offset: true }).optional(),
});

// ─── Access Rule ────────────────────────────────────────────────
export const createAccessRuleSchema = z.object({
  targetType: z.enum(['USER', 'DEPARTMENT']),
  targetId: z.string().min(1, 'Target ID is required'),
  accessLevel: z.enum(['VIEW', 'EDIT', 'ADMIN']),
  policy: z.enum(['ALLOW', 'DENY']),
});

// ─── Type exports ───────────────────────────────────────────────
export type CreateDiagramInput = z.infer<typeof createDiagramSchema>;
export type UpdateDiagramInput = z.infer<typeof updateDiagramSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type ListDiagramsQuery = z.infer<typeof listDiagramsQuerySchema>;
export type CreateAccessRuleInput = z.infer<typeof createAccessRuleSchema>;