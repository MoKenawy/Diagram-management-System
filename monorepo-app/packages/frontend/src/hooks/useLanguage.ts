// src/hooks/useLanguage.ts
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface UseLanguageReturn {
  lang: string;
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
  isRTL: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  dir: 'rtl' | 'ltr';
}

export function useLanguage(): UseLanguageReturn {
  const { t, i18n } = useTranslation();

  const lang = i18n.language || 'ar';
  const isRTL = lang === 'ar';
  const dir: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';

  const toggleLanguage = useCallback(() => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  }, [lang, i18n]);

  const setLanguage = useCallback(
    (newLang: string) => {
      i18n.changeLanguage(newLang);
    },
    [i18n]
  );

  const tFn = useCallback(
    (key: string, options?: Record<string, unknown>) => {
      return t(key, options as never) as unknown as string;
    },
    [t]
  );

  return useMemo(
    () => ({
      lang,
      toggleLanguage,
      setLanguage,
      isRTL,
      t: tFn,
      dir,
    }),
    [lang, toggleLanguage, setLanguage, isRTL, tFn, dir]
  );
}