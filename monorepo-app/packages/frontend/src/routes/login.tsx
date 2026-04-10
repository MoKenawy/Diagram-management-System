// src/routes/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { lazy, Suspense } from 'react';
import { LoginPageSkeleton } from '@/components/login/LoginPageSkeleton';



export const Route = createFileRoute('/login')({
  beforeLoad: () => {

    const { user } = useAuthStore.getState();
    if (user) {
      throw redirect({ to: '/' });
    }
  },
  component: () => {
    const LoginPage = lazy(() => import('@/pages/LoginPage'));
    return (
      <Suspense fallback={<LoginPageSkeleton />}>
        <LoginPage />
      </Suspense>
    );
  },
});