// src/hooks/queries/useArchiveQuery.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getDiagrams } from '@/api/services/diagramService';
import { diagramKeys } from './useDiagramQueries';
import type { DiagramListParams } from '@/types/index';
import type { ArchiveSearchParams } from '@/validations/archiveSearchSchema'; // Correct path

const buildDiagramParams = (search: ArchiveSearchParams): DiagramListParams => {
  // Construct the base params from search, handling defaults
  const params: DiagramListParams = {
    page: search.page ?? 1,
    limit: search.limit ?? 20,
    search: search.search || undefined,
    uploadedFrom: search.uploadedFrom || undefined,
    uploadedTo: search.uploadedTo || undefined,
    // Pass arrays directly. The axiosInstance will use qs.stringify
    // to convert them into repeated query parameters (e.g., fileFormat=PDF&fileFormat=DWG)
    fileFormat: search.fileFormat && search.fileFormat.length > 0
      ? search.fileFormat
      : undefined,
    departmentId: search.departmentId && search.departmentId.length > 0
      ? search.departmentId
      : undefined,
  };

  return params;
};

export const useArchiveQuery = (search: ArchiveSearchParams) => {
  const params = buildDiagramParams(search);

  return useQuery({
    queryKey: diagramKeys.list(params),
    queryFn: () => getDiagrams(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};