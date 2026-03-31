// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from './locales/ar.json';
import en from './locales/en.json';

const updateDocumentDirection = (lang: string) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  // Update font family for Arabic
  if (lang === 'ar') {
    document.documentElement.style.fontFamily =
      '"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif';
  } else {
    document.documentElement.style.fontFamily =
      '"Inter", "Segoe UI", sans-serif';
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: 'ar',
    defaultNS: 'translation',

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

// Set initial direction
updateDocumentDirection(i18n.language || 'ar');

// Listen for language changes
i18n.on('languageChanged', (lang: string) => {
  updateDocumentDirection(lang);
});

export default i18n;