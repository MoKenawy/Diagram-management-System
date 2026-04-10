// src/hooks/queries/useDiagramMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { privateApi as api } from '@/api/axiosClient';
import type{ 
  DiagramCreateResponse, 
  DiagramVersionResponse, 
  DiagramAccessRuleResponse,
  DiagramAccessRuleCreateRequest
} from '@/types/index';

// Mocking the axios client instance

interface CreateDiagramVariables {
  formData: FormData;
  onProgress?: (progress: number) => void;
}

export function useCreateDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, onProgress }: CreateDiagramVariables) => {
      const response = await api.post<DiagramCreateResponse>('/api/diagrams', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(percentCompleted);
          }
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
    },
  });
}

export function useCreateAccessRule() {
  return useMutation({
    mutationFn: async ({ diagramId, rule }: { diagramId: string; rule: DiagramAccessRuleCreateRequest }) => {
      const response = await api.post<DiagramAccessRuleResponse>(
        `/api/diagrams/${diagramId}/access`,
        rule
      );
      return response.data;
    },
  });
}

interface CreateVersionVariables {
  diagramId: string;
  formData: FormData;
  onProgress?: (progress: number) => void;
}

export function useCreateDiagramVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ diagramId, formData, onProgress }: CreateVersionVariables) => {
      const response = await api.post<DiagramVersionResponse>(
        `/api/diagrams/${diagramId}/versions`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress?.(percentCompleted);
            }
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diagrams'] });
      queryClient.invalidateQueries({ queryKey: ['diagrams', variables.diagramId] });
      queryClient.invalidateQueries({ queryKey: ['diagrams', variables.diagramId, 'versions'] });
    },
  });
}