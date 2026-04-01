// src/pages/dashboard/components/CreateDiagramModal.tsx
import React, { useState, useCallback, useRef, type FormEvent } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';

interface CreateDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDiagramModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDiagramModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [station, setStation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setStation('');
    setFile(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  }, [isUploading, resetForm, onClose]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!file || !title.trim()) return;

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('stationName', station.trim());
        formData.append('file', file);

        const { default: apiClient } = await import('../../../api/client');
        await apiClient.post('/diagrams', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        resetForm();
        onSuccess();
        onClose();
      } catch {
        // Error handling is managed by the API client interceptor
      } finally {
        setIsUploading(false);
      }
    },
    [file, title, station, resetForm, onSuccess, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {t('archive.upload')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diagram-title" className="mb-1 block text-sm font-medium text-gray-700">
              {t('archive.fileName')} *
            </label>
            <input
              id="diagram-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="diagram-station" className="mb-1 block text-sm font-medium text-gray-700">
              {t('archive.station')}
            </label>
            <input
              id="diagram-station"
              type="text"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('archive.fileType')} *
            </label>
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div>
                  <svg className="mx-auto mb-2 h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">{t('archive.upload')}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.dwg,.dxf,.svg,.png,.jpg"
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading || !file || !title.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? t('common.loading') : t('archive.upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}