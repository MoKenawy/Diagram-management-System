// src/schemas/admin.schema.ts
import { z } from 'zod';

export const updateConfigSchema = z.record(z.string(), z.string());

export const auditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().optional(),
  action: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export const restoreSchema = z.object({
  confirmToken: z.literal('RESTORE', {
    message: 'confirmToken must be exactly "RESTORE"',
  }),
});

export const createReplicationTargetSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535).default(22),
  label: z.string().min(1, 'Label is required'),
  sshUsername: z.string().min(1, 'SSH username is required'),
  sshKeyPath: z.string().min(1, 'SSH key path is required'),
});

export const updateReplicationTargetSchema = z.object({
  host: z.string().min(1).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  label: z.string().min(1).optional(),
  sshUsername: z.string().min(1).optional(),
  sshKeyPath: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type AuditLogsQueryInput = z.infer<typeof auditLogsQuerySchema>;
export type CreateReplicationTargetInput = z.infer<typeof createReplicationTargetSchema>;
export type UpdateReplicationTargetInput = z.infer<typeof updateReplicationTargetSchema>;