import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// @ts-ignore - JSON imports
import enTranslations from '../../locales/en.json';
// @ts-ignore - JSON imports
import arTranslations from '../../locales/ar.json';
// @ts-ignore - JSON imports
import hiTranslations from '../../locales/hi.json';
// @ts-ignore - JSON imports
import esTranslations from '../../locales/es.json';
// @ts-ignore - JSON imports
import frTranslations from '../../locales/fr.json';
// @ts-ignore - JSON imports
import deTranslations from '../../locales/de.json';
// @ts-ignore - JSON imports
import ptTranslations from '../../locales/pt.json';
// @ts-ignore - JSON imports
import itTranslations from '../../locales/it.json';
// @ts-ignore - JSON imports
import ruTranslations from '../../locales/ru.json';
// @ts-ignore - JSON imports
import jaTranslations from '../../locales/ja.json';
// @ts-ignore - JSON imports
import koTranslations from '../../locales/ko.json';
// @ts-ignore - JSON imports
import zhTranslations from '../../locales/zh.json';

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
  hi: { translation: hiTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  de: { translation: deTranslations },
  pt: { translation: ptTranslations },
  it: { translation: itTranslations },
  ru: { translation: ruTranslations },
  ja: { translation: jaTranslations },
  ko: { translation: koTranslations },
  zh: { translation: zhTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'hi', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

