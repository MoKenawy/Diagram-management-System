// src/hooks/useCreateDiagramForm.ts
import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import type { ZodIssue } from 'zod';

import { useCreateDiagramMutation } from '@/hooks/queries/useCreateDiagramMutation';
import {
  createDiagramSchema,
  type CreateDiagramFormErrors,
  type CreateDiagramFormState,
} from '@/validations/diagramCreateSchema';

const INITIAL_VALUES: CreateDiagramFormState = {
  title: '',
  description: '',
  departmentId: '',
  tags: [],
  revisionLabel: '',
  changeSummary: '',
  file: null,
};

interface ApiErrorBody {
  message?: string;
  error?: string;
}

const extractServerError = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorBody>;

  if (axiosError?.response?.data) {
    const { message, error: code } = axiosError.response.data;
    if (message) return message;
    if (code) return code;
  }

  if (axiosError && !axiosError.response) {
    return 'Network error. Please check your connection and try again.';
  }

  return 'Failed to create the diagram. Please try again.';
};

const formatZodErrors = (issues: ZodIssue[]): CreateDiagramFormErrors => {
  const result: CreateDiagramFormErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof CreateDiagramFormState;
    if (field && !result[field]) {
      result[field] = issue.message;
    }
  }
  return result;
};

const buildFormData = (values: CreateDiagramFormState): FormData => {
  const formData = new FormData();

  formData.append('title', values.title.trim());
  formData.append('departmentId', values.departmentId);
  formData.append('revisionLabel', values.revisionLabel.trim());
  formData.append('changeSummary', values.changeSummary.trim());

  const description = values.description.trim();
  if (description) formData.append('description', description);

  // Tags are sent as repeated form fields so the backend receives an array,
  // matching createDiagramSchema's z.array(z.string()) and the service's
  // tags.map(...). If the backend instead expects a single comma-separated
  // string, replace the loop with:
  //   if (values.tags.length) formData.append('tags', values.tags.join(','));
  values.tags.forEach((tag) => {
    const trimmed = tag.trim();
    if (trimmed) formData.append('tags', trimmed);
  });

  // File existence is guaranteed by schema validation before buildFormData runs.
  formData.append('file', values.file as File);
  return formData;
};

export interface UseCreateDiagramFormResult {
  values: CreateDiagramFormState;
  errors: CreateDiagramFormErrors;
  isSubmitting: boolean;
  serverError: string | null;
  setField: <K extends keyof CreateDiagramFormState>(
    field: K,
    value: CreateDiagramFormState[K]
  ) => void;
  clearError: (field: keyof CreateDiagramFormState) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
}

export const useCreateDiagramForm = (): UseCreateDiagramFormResult => {
  const navigate = useNavigate();
  const mutation = useCreateDiagramMutation();

  const [values, setValues] = useState<CreateDiagramFormState>(INITIAL_VALUES);
  const [errors, setErrors] = useState<CreateDiagramFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const setField = useCallback<UseCreateDiagramFormResult['setField']>(
    (field, value) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const clearError = useCallback((field: keyof CreateDiagramFormState) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setServerError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setServerError(null);

      const parsed = createDiagramSchema.safeParse(values);
      if (!parsed.success) {
        setErrors(formatZodErrors(parsed.error.issues));
        return;
      }

      setErrors({});
      try {
        const response = await mutation.mutateAsync(buildFormData(values));
        // Send the user to the new diagram's detail page; the list cache was
        // already invalidated by the mutation's onSuccess.
        await navigate({ to: '/diagrams/$id', params: { id: response.diagram.id } });
      } catch (error) {
        setServerError(extractServerError(error));
      }
    },
    [mutation, navigate, values]
  );

  return {
    values,
    errors,
    isSubmitting: mutation.isPending,
    serverError,
    setField,
    clearError,
    handleSubmit,
    reset,
  };
};
