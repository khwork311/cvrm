import { Language, useLanguage } from '../../hooks/useLanguage';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentLanguage === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentLanguage === 'ar'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        aria-label="Switch to Arabic"
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
