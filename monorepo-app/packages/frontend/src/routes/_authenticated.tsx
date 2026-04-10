// src/routes/_authenticated.tsx

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();

    if (!user) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: () => <AppShell> 
    <Outlet />
  </AppShell>,
});
