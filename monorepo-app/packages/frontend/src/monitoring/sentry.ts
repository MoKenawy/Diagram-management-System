import * as Sentry from '@sentry/react';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,

    integrations: [],

    tracesSampleRate: 1.0, // adjust later in prod

    beforeSend(event) {
      // optional: filter sensitive data
      return event;
    },
  });
}
