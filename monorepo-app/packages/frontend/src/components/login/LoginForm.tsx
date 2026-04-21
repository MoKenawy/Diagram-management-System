// src/components/login/LoginForm.tsx
import type { UseFormReturn } from 'react-hook-form';
import type { LoginFormValues } from '@/validations/authValidation';

import { LoginErrorAlert } from './LoginErrorAlert';
import { UsernameField } from './UsernameField';
import { PasswordField } from './PasswordField';
import { SubmitButton } from './SubmitButton';
import { LoginFooter } from './LoginFooter';
import { ErrorButton } from '../shared/ErrorButton';

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  showPassword: boolean;
  isPending: boolean;
  error: string | null;
  submitAction: (formData: FormData) => void;
  onTogglePassword: () => void;
  onClearError: () => void;
}

export const LoginForm = ({
  form,
  showPassword,
  isPending,
  error,
  submitAction,
  onTogglePassword,
  onClearError,
}: LoginFormProps) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      {error && <LoginErrorAlert error={error} onClose={onClearError} />}

      <form action={submitAction} className="space-y-6">
        <UsernameField
          registration={register('username')}
          error={errors.username}
          disabled={isPending}
        />

        <PasswordField
          registration={register('password')}
          error={errors.password}
          disabled={isPending}
          showPassword={showPassword}
          onToggleVisibility={onTogglePassword}
        />

        <ErrorButton />

        <SubmitButton isLoading={isPending} />
      </form>

      <LoginFooter />
    </>
  );
};