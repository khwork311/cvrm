import PageMeta from '@/components/common/PageMeta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAcceptInvitation, useValidateInvitationToken } from './hooks';
import { acceptInvitationSchema, type AcceptInvitationFormData } from './schemas';

export const AcceptInvitation = () => {
  const { t, ready } = useTranslation(['vendors', 'common', 'validation']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Use SWR to validate token
  const { data: validationData, isLoading: isValidating } = useValidateInvitationToken(token);
  const { trigger: acceptInvitation, isMutating: isSubmitting } = useAcceptInvitation();

  const isValid = validationData?.valid ?? false;
  const vendorInfo = validationData?.vendor;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) return;

    try {
      await acceptInvitation({
        ...data,
        token,
      });

      // Note: API returns vendor data, not auth token
      // Token would be handled by backend session/cookie

      // Show success message
      alert(t('vendors:accountCreatedSuccessfully'));

      // Redirect to profile completion wizard
      navigate('/vendors/complete-profile');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert(t('vendors:failedToCreateAccount'));
    }
  };

  if (!ready || isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  if (!token || !isValid) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:invalidInvitation')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('vendors:invalidInvitationDescription')}</p>
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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:welcomeVendor')}</h1>
            {vendorInfo && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('vendors:invitedBy')} <span className="font-medium">{vendorInfo.company_name}</span>
              </p>
            )}
          </div>

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
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
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
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
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
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
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
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
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
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.password.message || 'validation:passwordMinLength')}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:confirmPassword')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="password_confirmation"
                  type="password"
                  {...register('password_confirmation')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.password_confirmation.message || 'validation:passwordMismatch')}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone_number" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone_number"
                  type="tel"
                  {...register('phone_number')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.phone_number.message || 'validation:required')}</p>
                )}
              </div>
            </div>

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
      </div>
    </>
  );
};
