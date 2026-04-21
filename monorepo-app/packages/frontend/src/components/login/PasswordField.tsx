// src/components/login/PasswordField.tsx
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface PasswordFieldProps {
  registration: UseFormRegisterReturn<'password'>;
  error?: FieldError;
  disabled: boolean;
  showPassword: boolean;
  onToggleVisibility: () => void;
}

export const PasswordField = ({
  registration,
  error,
  disabled,
  showPassword,
  onToggleVisibility,
}: PasswordFieldProps) => (
  <div className="space-y-1.5">
    <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center justify-between" htmlFor="password">
      <span>رمز المصادقة</span>
      <span className="english text-[10px] font-normal text-outline">Password</span>
    </label>
    <div className="relative">
      <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-outline-variant" style={{ fontSize: '1.125rem' }}>key</span>
      <input 
        className={`w-full pr-10 pl-10 py-3 bg-surface-container-low border ${error ? 'border-error' : 'border-transparent focus:border-outline-variant/30'} focus:bg-surface-container-lowest focus:ring-0 rounded-lg text-on-surface font-mono text-sm transition-all duration-200 text-right`}
        id="password" 
        placeholder="••••••••" 
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        {...registration}
      />
      <button 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors" 
        type="button"
        onClick={onToggleVisibility}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
          {showPassword ? 'visibility' : 'visibility_off'}
        </span>
      </button>
    </div>
    {error && <p className="text-xs text-error mt-1">{error.message}</p>}
  </div>
);