// src/hooks/useDiagramDownload.ts
import { useCallback } from 'react';
import { privateApi as api } from '@/api/axiosClient';
import { getDownloadUrl } from '@/utils/diagramFormatUtils';

export const useDiagramDownload = () => {
  const download = useCallback(async (diagramId: string, versionId: string) => {
    try {
      const url = getDownloadUrl(diagramId, versionId);
      const response = await api.get(url, { responseType: 'blob' });

      const contentDisposition = response.headers['content-disposition'] ?? '';
      const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
      const filename = filenameMatch?.[1] ?? `diagram-${versionId}`;

      const blobUrl = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  return { download } as const;
};