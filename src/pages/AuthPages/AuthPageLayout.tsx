import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GridShape from '../../components/common/GridShape';
import ThemeTogglerTwo from '../../components/common/ThemeTogglerTwo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('auth');
  return (
    <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
        {children}
        <div className="bg-brand-950 hidden h-full w-full items-center lg:grid lg:w-1/2 dark:bg-white/5">
          <div className="relative z-1 flex items-center justify-center">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex max-w-xs flex-col items-center">
              <Link to="/" className="mb-4 block">
                <img width={231} height={48} src="/images/logo/main logo cyan.png" alt="Logo" />
              </Link>
              <p className="text-center text-gray-300 dark:text-white/60">{t('auth:companyInfo')}</p>
            </div>
          </div>
        </div>
        <div className="fixed end-6 bottom-6 z-50 hidden gap-4 sm:flex">
          <ThemeTogglerTwo />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
