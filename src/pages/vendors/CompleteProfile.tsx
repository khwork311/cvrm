import PageMeta from '@/components/common/PageMeta';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const CompleteProfile = () => {
  const { t, ready } = useTranslation(['vendors', 'common']);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSkip = () => {
    navigate('/');
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/');
    }
  };

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={ready ? t('vendors:completeProfile') : 'Complete Profile'}
        description={ready ? t('vendors:completeProfileDescription') : 'Complete your vendor profile'}
      />

      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
        <div className="w-full max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    s <= step ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-20 ${s < step ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            {step === 1 && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {t('vendors:step1Title')}
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">{t('vendors:step1Description')}</p>
                <div className="text-center text-gray-500">
                  <p>{t('vendors:addressFormPlaceholder')}</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {t('vendors:step2Title')}
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">{t('vendors:step2Description')}</p>
                <div className="text-center text-gray-500">
                  <p>{t('vendors:bankAccountFormPlaceholder')}</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {t('vendors:step3Title')}
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">{t('vendors:step3Description')}</p>
                <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
                  <div className="mb-4 text-6xl">✓</div>
                  <p className="text-lg font-medium text-green-800 dark:text-green-300">
                    {t('vendors:profileComplete')}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                onClick={handleSkip}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('vendors:skipForNow')}
              </button>
              <button
                onClick={handleNext}
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                {step === 3 ? t('vendors:goToDashboard') : t('vendors:next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
