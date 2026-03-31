// src/utils/logger.ts
import pino from 'pino';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: {
    service: 'backend',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.newPassword',
      'body.passwordHash',
      'body.sshKeyPath',
      '*.password',
      '*.newPassword',
      '*.passwordHash',
      '*.sshKeyPath',
      '*.token',
    ],
    remove: true,
  },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const start = process.hrtime.bigint();

  req.requestId = requestId;
  req.log = logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    req.log.info(
      {
        statusCode: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - start) / 1e6,
      },
      'request completed'
    );
  });

  next();
}

export function getLogger(req?: Request) {
  return req?.log ?? logger;
}