// src/schemas/departments.schema.ts
import { z } from 'zod';

export const createDepartmentSchema = z.object({
  nameAr: z.string().min(2, 'Arabic name must be at least 2 characters'),
  nameEn: z.string().min(2, 'English name must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'Code must be between 2 and 10 characters')
    .max(10, 'Code must be between 2 and 10 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Code must contain only alphanumeric characters and underscores')
    .transform((val) => val.toUpperCase()),
});

export const updateDepartmentSchema = z.object({
  nameAr: z.string().min(2, 'Arabic name must be at least 2 characters').optional(),
  nameEn: z.string().min(2, 'English name must be at least 2 characters').optional(),
  code: z
    .string()
    .min(2, 'Code must be between 2 and 10 characters')
    .max(10, 'Code must be between 2 and 10 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Code must contain only alphanumeric characters and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;