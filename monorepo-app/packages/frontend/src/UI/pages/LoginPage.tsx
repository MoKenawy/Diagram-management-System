// src/pages/LoginPage.tsx
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLoginForm } from '@/hooks/useLoginForm';
import { LoginCard, LoginHeader, LoginForm } from '@/UI/components/login';

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

  // Resolve the displayed error: action state error takes priority
  const displayError = actionState.error;

  return (
    <LoginCard>
      <LoginHeader />
      <LoginForm
        form={form}
        showPassword={showPassword}
        isPending={isPending}
        error={displayError}
        submitAction={submitAction}
        onTogglePassword={togglePasswordVisibility}
        onClearError={clearError}
      />
    </LoginCard>
  );
};

export default LoginPage;