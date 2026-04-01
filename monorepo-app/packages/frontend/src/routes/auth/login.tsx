// src/routes/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { lazy, Suspense } from 'react';
import { LoginPageSkeleton } from '@/UI/components/login/LoginPageSkeleton';

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user) {
      throw redirect({ to: '/' });
    }
  },
  component: () => {
    const LoginPage = lazy(() => import('@/UI/pages/LoginPage'));
    return (
      <Suspense fallback={<LoginPageSkeleton />}>
        <LoginPage />
      </Suspense>
    );
  },
});