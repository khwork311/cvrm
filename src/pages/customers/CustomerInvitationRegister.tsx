import PageMeta from '@/components/common/PageMeta';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import Alert from '@/components/ui/alert/Alert';
import { CheckCircleIcon } from '@/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useRegisterFromInvitation } from './hooks/useCustomers';
import { RegisterFromInvitationFormData, registerFromInvitationSchema } from './schemas';

export const CustomerInvitationRegister = () => {
  const { t, ready } = useTranslation(['vendors', 'common', 'validation']);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const company_id = Number(searchParams.get('company_id'));

  const [success, setSuccess] = useState(false);

  const {
    trigger: registerFromInvitation,
    isMutating: isSubmitting,
    error: regiterationError,
  } = useRegisterFromInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFromInvitationFormData>({
    resolver: zodResolver(registerFromInvitationSchema),
  });

  const onSubmit = async (data: RegisterFromInvitationFormData) => {
    if (!token) return;

    try {
      await registerFromInvitation({
        ...data,
        token,
        company_id,
        // group_id: 3,
        // role_id: 1,
        // name: 'أحمد عماد دعوة',
        // status: 0,
      });

      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  console.log(regiterationError);

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white/90">
              {t('auth:registrationSuccess')}
            </h1>

            {/* Message */}
            <p className="mb-2 text-gray-600 dark:text-gray-400">{t('auth:registrationPendingApproval')}</p>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{t('auth:activationEmailSent')}</p>

            {/* Additional Info */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">{t('auth:checkEmailInstructions')}</p>
            </div>
          </div>
          <div className="fixed end-6 bottom-6 z-50 flex gap-4">
            <ThemeTogglerTwo />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={ready ? t('vendors:acceptInvitation') : 'Accept Invitation'}
        description={ready ? t('vendors:acceptInvitationDescription') : 'Accept vendor invitation'}
      />

      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
        <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name_en" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:nameEn')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="name_en"
                  type="text"
                  {...register('name_en')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.name_en && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.name_en.message || 'validation:required')}</p>
                )}
              </div>

              <div>
                <label htmlFor="name_ar" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:nameAr')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="name_ar"
                  type="text"
                  {...register('name_ar')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.name_ar && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.name_ar.message || 'validation:required')}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:email')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.email.message || 'validation:invalidEmail')}</p>
                )}
              </div>

              <div>
                <label htmlFor="tax_number" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:taxNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="tax_number"
                  type="text"
                  {...register('tax_number')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.tax_number && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.tax_number.message || 'validation:required')}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:password')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {t(errors.password.message || 'validation:passwordMinLength')}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password_confirmation"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('vendors:confirmPassword')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="password_confirmation"
                  type="password"
                  {...register('password_confirmation')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-500">
                    {t(errors.password_confirmation.message || 'validation:passwordMismatch')}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone_number"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('vendors:phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone_number"
                  type="tel"
                  {...register('phone_number')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.phone_number.message || 'validation:required')}</p>
                )}
              </div>
            </div>
            {/* Response Error */}
            {regiterationError && (
              <Alert variant="error" title="Error" message={regiterationError.response.data.message} showLink={false} />
            )}

            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? t('vendors:creatingAccount') : t('vendors:createAccount')}
              </button>
            </div>
          </form>
        </div>
        <div className="fixed end-6 bottom-6 z-50 flex gap-4">
          <ThemeTogglerTwo />
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
};
