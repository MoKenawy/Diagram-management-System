// src/components/login/LoginErrorAlert.tsx
interface LoginErrorAlertProps {
  error: string;
  onClose: () => void;
}

export const LoginErrorAlert = ({ error, onClose }: LoginErrorAlertProps) => (
  <div className="mb-8 bg-error-container text-on-error-container p-4 rounded-lg flex items-start gap-3 border border-error/20" id="error-panel">
    <span className="material-symbols-outlined mt-0.5 text-error">gpp_bad</span>
    <div className="flex-1">
      <h3 className="font-headline font-semibold text-sm">خطأ في المصادقة</h3>
      <p className="font-body text-xs mt-1 opacity-90">{error}</p>
    </div>
    <button type="button" onClick={onClose} className="text-error hover:text-on-error-container ml-2">
      <span className="material-symbols-outlined mt-0.5" style={{ fontSize: '1.25rem' }}>close</span>
    </button>
  </div>
);