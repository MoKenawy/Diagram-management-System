// src/hooks/useAuthenticatedUrl.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api/authService';

export const useAuthenticatedBlobUrl = (
  url: string | null,
  mimeType?: string
): { blobUrl: string | null; isLoading: boolean; error: boolean } => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    const fetchBlob = async (): Promise<void> => {
      setIsLoading(true);
      setError(false);
      try {
        const response = await api.get(url, { responseType: 'blob' });
        if (revoked) return;

        const blob: Blob = mimeType
          ? new Blob([response.data as BlobPart], { type: mimeType })
          : (response.data as Blob);

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!revoked) setError(true);
      } finally {
        if (!revoked) setIsLoading(false);
      }
    };

    fetchBlob();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, mimeType]);

  return { blobUrl, isLoading, error };
};