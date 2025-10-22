import PageMeta from '@/components/common/PageMeta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSendInvitation, useVendor } from './hooks';
import { sendInvitationSchema, type SendInvitationFormData } from './schemas';

export const SendInvitation = () => {
  const { t, ready } = useTranslation(['vendors', 'common', 'validation']);
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();

  const { data: apiVendorResponse, isLoading: isLoadingVendor } = useVendor(vendorId ? parseInt(vendorId) : null);
  
  // Extract vendor data from API response
  const vendor = apiVendorResponse?.data;
  
  const { trigger: sendInvitation, isMutating: isSending } = useSendInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SendInvitationFormData>({
    resolver: zodResolver(sendInvitationSchema),
    defaultValues: {
      email: '',
      name_en: '',
      phone_number: '',
      name_ar: '',
      tax_number: '',
    },
  });

  // Update form when vendor data is loaded
  useEffect(() => {
    if (vendor) {
      reset({
        email: vendor.email,
        name_en: vendor.name_en,
        phone_number: vendor.phone_number,
        name_ar: vendor.name_ar || '',
        tax_number: vendor.tax_number || '',
      });
    }
  }, [vendor, reset]);

  const onSubmit = async (data: SendInvitationFormData) => {
    if (!vendorId) return;

    try {
      await sendInvitation(data);
      // Show success message
      alert(`Invitation sent successfully to ${data.email}!`);
      navigate(`/vendors/${vendorId}`);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      // Show error message
      alert('Failed to send invitation. Please try again.');
    }
  };

  if (!ready || isLoadingVendor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('vendors:vendorNotFound')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={ready ? t('vendors:sendInvitation') : 'Send Invitation'}
        description={ready ? t('vendors:sendInvitationDescription') : 'Send invitation to vendor'}
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:sendInvitation')}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('vendors:sendInvitationTo')} <span className="font-medium">{vendor.name_en}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(`/vendors/${vendorId}`)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t('common:cancel')}
          </button>
        </div>

        <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('vendors:invitationEmailNote')}</p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="font-medium text-blue-900 dark:text-blue-300">{t('vendors:invitationInfoTitle')}</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>• {t('vendors:invitationInfoItem1')}</li>
                <li>• {t('vendors:invitationInfoItem2')}</li>
                <li>• {t('vendors:invitationInfoItem3')}</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(`/vendors/${vendorId}`)}
                disabled={isSending}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('common:cancel')}
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                )}
                {isSending ? t('vendors:sendingInvitation') : t('vendors:sendInvitation')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
