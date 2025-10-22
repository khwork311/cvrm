import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'ar';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as Language;
  const isRTL = currentLanguage === 'ar';

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  return {
    currentLanguage,
    isRTL,
    changeLanguage,
  };
};
