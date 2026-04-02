import { api } from '@/services/api/authService';
// src/services/api/diagramService.ts
import type {
  DiagramPaginatedResponse,
  DiagramListParams,
  DiagramDetailResponse,
  DiagramCreateResponse,
  DiagramUpdateRequest,
  DiagramDeactivateResponse,
} from '@/types/index';

export const getDiagrams = async (params: DiagramListParams): Promise<DiagramPaginatedResponse> => {
  const response = await api.get<DiagramPaginatedResponse>('/api/diagrams', { params });
  return response.data;
};

export const getDiagram = async (id: string): Promise<DiagramDetailResponse> => {
  const response = await api.get<DiagramDetailResponse>(`/api/diagrams/${id}`);
  return response.data;
};

export const createDiagram = async (formData: FormData): Promise<DiagramCreateResponse> => {
  const response = await api.post<DiagramCreateResponse>('/api/diagrams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateDiagram = async (
  id: string,
  data: DiagramUpdateRequest
): Promise<DiagramDetailResponse> => {
  const response = await api.patch<DiagramDetailResponse>(`/api/diagrams/${id}`, data);
  return response.data;
};

export const deactivateDiagram = async (id: string): Promise<DiagramDeactivateResponse> => {
  const response = await api.delete<DiagramDeactivateResponse>(`/api/diagrams/${id}`);
  return response.data;
};