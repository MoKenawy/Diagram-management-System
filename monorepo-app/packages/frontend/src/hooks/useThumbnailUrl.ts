// src/hooks/useThumbnailUrl.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api/authService';

export const useThumbnailUrl = (
  diagramId: string,
  versionId: string | null | undefined
): string | null => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!versionId) {
      setBlobUrl(null);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    const fetchThumbnail = async () => {
      try {
        const response = await api.get(
          `/api/diagrams/${diagramId}/versions/${versionId}/thumbnail`,
          { responseType: 'blob' }
        );
        if (revoked) return;

        objectUrl = URL.createObjectURL(response.data as Blob);
        setBlobUrl(objectUrl);
      } catch {
        // Thumbnail not available (404 for DWG, etc.)
        setBlobUrl(null);
      }
    };

    fetchThumbnail();

    return () => {
      revoked = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [diagramId, versionId]);

  return blobUrl;
};