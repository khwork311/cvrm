import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Lazy load translation files
  .use(
    resourcesToBackend((locale: string, namespace: string) => {
      return import(`../locales/${locale.split('-')[0]}/${namespace}.json`);
    })
  )
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'navigation', 'plans', 'validation', 'companies', 'customers', 'customerGroups', 'roles', 'users', 'vendors', 'vendorGroups'],
    supportedLngs: ['en', 'ar'],

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
