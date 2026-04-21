// src/components/login/UsernameField.tsx
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface UsernameFieldProps {
  registration: UseFormRegisterReturn<'username'>;
  error?: FieldError;
  disabled: boolean;
}

export const UsernameField = ({ registration, error, disabled }: UsernameFieldProps) => (
  <div className="space-y-1.5">
    <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center justify-between" htmlFor="username">
      <span>اسم المستخدم / رقم التعريف</span>
      <span className="english text-[10px] font-normal text-outline">Username</span>
    </label>
    <div className="relative">
      <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-outline-variant" style={{ fontSize: '1.125rem' }}>badge</span>
      <input 
        className={`w-full pr-10 pl-4 py-3 bg-surface-container-low border ${error ? 'border-error' : 'border-transparent focus:border-outline-variant/30'} focus:bg-surface-container-lowest focus:ring-0 rounded-lg text-on-surface font-body text-sm transition-all duration-200 placeholder-outline-variant text-right`}
        id="username" 
        placeholder="مثال: ENG-4092" 
        type="text"
        disabled={disabled}
        {...registration}
      />
    </div>
    {error && <p className="text-xs text-error mt-1">{error.message}</p>}
  </div>
);