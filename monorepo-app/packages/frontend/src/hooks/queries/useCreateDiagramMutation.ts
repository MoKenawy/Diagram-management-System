// src/hooks/queries/useCreateDiagramMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDiagram } from '@/api/services/diagramService';
import type { DiagramCreateResponse } from '@/types/index';

/**
 * Wraps the multipart POST /api/diagrams call in a React Query mutation.
 * On success it invalidates the diagrams list cache so the new diagram
 * appears in the archive / dashboard without a manual refetch.
 */
export const useCreateDiagramMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<DiagramCreateResponse, Error, FormData>({
    mutationFn: (formData) => createDiagram(formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['diagrams'] });
    },
  });
};
