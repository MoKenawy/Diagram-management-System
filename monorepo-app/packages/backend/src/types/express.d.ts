import { Role } from '@prisma/client';
import pino from 'pino';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        departmentId: string | null;
      };
      requestId?: string;
      log: pino.Logger;
      validatedQuery: Record<string, any>;
      validatedParams: Record<string, any>;
      validatedBody: Record<string, any>;
    }
  }
}

export {};
