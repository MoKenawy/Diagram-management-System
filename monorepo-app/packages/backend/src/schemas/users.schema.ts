// src/schemas/users.schema.ts
import { z } from 'zod';

export const createUserSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').optional().nullable(),
    role: z.enum(['ENGINEER', 'DC', 'MANAGER', 'ADMIN']),
    departmentId: z.string().optional().nullable(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(
    (data) => {
      if (data.role === 'ENGINEER' && !data.departmentId) {
        return false;
      }
      return true;
    },
    {
      message: 'Department is required for ENGINEER role',
      path: ['departmentId'],
    }
  );

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().nullable(),
  role: z.enum(['ENGINEER', 'DC', 'MANAGER', 'ADMIN']).optional(),
  departmentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const usersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(['ENGINEER', 'DC', 'MANAGER', 'ADMIN', '']).optional(),
  departmentId: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  search: z.string().optional(),
});

// NEW: Confirm deletion schema
export const deleteUserSchema = z.object({
  confirmUsername: z.string().min(1, 'You must confirm the username to delete'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;