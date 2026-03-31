// src/schemas/reports.schema.ts
import { z } from 'zod';

export const reportQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export const uploadsOverTimeQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  granularity: z.enum(['day', 'week', 'month']).default('month'),
});

export const exportQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  format: z.enum(['pdf', 'excel']),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type UploadsOverTimeQueryInput = z.infer<typeof uploadsOverTimeQuerySchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;