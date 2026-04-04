// src/hooks/useLoginForm.ts
import { useState, useCallback, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/validations/authValidation';
import type { LoginFormValues } from '@/validations/authValidation';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@/types/index';

// ─── Action State Types ────────────────────────────────────────
interface LoginActionState {
  success: boolean;
  error: string | null;
}

const INITIAL_STATE: LoginActionState = {
  success: false,
  error: null,
};

// ─── Hook ──────────────────────────────────────────────────────
export const useLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, clearError } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginAction = async (
    _previousState: LoginActionState,
    formData: FormData
  ): Promise<LoginActionState> => {
    const rawUsername = formData.get('username');
    const rawPassword = formData.get('password');

    // Validate via Zod
    const result = loginSchema.safeParse({
      username: rawUsername,
      password: rawPassword,
    });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Validation failed';
      return { success: false, error: firstError };
    }

    const credentials: LoginRequest = {
      username: result.data.username,
      password: result.data.password,
    };

    try {
      await login(credentials);
      return { success: true, error: null };
    } catch {
      // Error message is already set in authStore,
      // but we also surface it through action state
      const storeError = useAuthStore.getState().error;
      return {
        success: false,
        error: storeError ?? 'Login failed. Please try again.',
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    form,
    showPassword,
    togglePasswordVisibility,
    isPending,
    submitAction,
    actionState: state,
    clearError: handleClearError,
  } as const;
};