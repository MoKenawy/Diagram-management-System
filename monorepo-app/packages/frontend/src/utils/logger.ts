import pino from 'pino';
import * as Sentry from '@sentry/react';

const isProd = import.meta.env.MODE === 'production';

export const logger = pino({
  level: isProd ? 'info' : 'debug',

  base: {
    service: 'frontend',
    env: import.meta.env.MODE,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  browser: {
    asObject: true,
  },

  redact: {
    paths: [
      'authorization',
      'headers.authorization',
      'headers.cookie',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.password',
    ],
    remove: true,
  },
});

// 🔗 create scoped logger (VERY IMPORTANT)
export const createLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// 🔥 unified logging API
export const log = {
  debug: (msg: string, data?: any) => {
    logger.debug(data, msg);
  },

  info: (msg: string, data?: any) => {
    logger.info(data, msg);
  },

  warn: (msg: string, data?: any) => {
    logger.warn(data, msg);
  },

  error: (msg: string, error?: any, data?: any) => {
    logger.error({ ...data, error }, msg);

    // 🔥 send to Sentry
    if (error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(msg, 'error');
    }
  },
};
