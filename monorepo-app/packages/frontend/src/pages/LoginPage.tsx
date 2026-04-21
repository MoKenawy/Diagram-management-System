// src/pages/LoginPage.tsx
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLoginForm } from '@/hooks/useLoginForm';
import {
  LoginCard,
  LoginHeader,
  LoginForm,
} from '@/components/login';

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    form,
    showPassword,
    togglePasswordVisibility,
    isPending,
    submitAction,
    actionState,
    clearError,
  } = useLoginForm();

  // Navigate on successful login
  useEffect(() => {
    if (actionState.success) {
      navigate({ to: '/' });
    }
  }, [actionState.success, navigate]);

  return (
    <LoginCard>
      <LoginHeader />
      <LoginForm
        form={form}
        showPassword={showPassword}
        isPending={isPending}
        error={actionState.error}
        submitAction={submitAction}
        onTogglePassword={togglePasswordVisibility}
        onClearError={clearError}
      />
    </LoginCard>
  );
};

export default LoginPage;