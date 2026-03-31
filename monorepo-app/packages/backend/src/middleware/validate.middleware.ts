// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: z.ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: errors,
      });
      return;
    }

    if (result.data === undefined || result.data === null) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
      });
      return;
    }

    switch (target) {
      case 'body':
        req.body = result.data;
        req.validatedBody = result.data;
        break;
      case 'query':
        req.validatedQuery = result.data;
        break;
      case 'params':
        req.validatedParams = result.data;
        break;
    }

    next();
  };
}