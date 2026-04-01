import { useState, type FormEvent } from 'react';
import { X, Upload } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface CreateDiagramModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDiagramModal({ open, onClose }: CreateDiagramModalProps) {
  const { t, isRTL } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/diagrams', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        onClose();
      }
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('uploadNewDiagram')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('title')}
            </label>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isRTL ? 'الوصف' : 'Description'}
            </label>
            <textarea
              name="description"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t('revision')}
              </label>
              <input
                name="revisionLabel"
                required
                placeholder="Rev A"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {isRTL ? 'القسم' : 'Department'}
              </label>
              <input
                name="departmentId"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isRTL ? 'ملخص التغيير' : 'Change Summary'}
            </label>
            <input
              name="changeSummary"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isRTL ? 'الملف' : 'File'}
            </label>
            <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-4">
              <Upload className="h-6 w-6 text-slate-400" />
              <input
                name="file"
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.svg,.dwg"
                className="text-sm text-slate-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting
                ? t('loading')
                : isRTL
                  ? 'رفع'
                  : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
