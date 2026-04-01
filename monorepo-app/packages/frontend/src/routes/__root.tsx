// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import { LinearProgress } from '@mui/material';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {isLoading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />}
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}