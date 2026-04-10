// src/components/login/LoginForm.tsx
import { Stack } from '@mui/material';
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
    <form action={submitAction}>
      <Stack spacing={2.5}>
        {error && <LoginErrorAlert error={error} onClose={onClearError} />}

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

        <SubmitButton isLoading={isPending} />

        <ErrorButton />
        <LoginFooter />
      </Stack>
    </form>
  );
};