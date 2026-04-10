import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect /admin to /admin/users automatically
export const Route = createFileRoute('/_authenticated/admin/')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin/users',
      replace: true,
    });
  },
});