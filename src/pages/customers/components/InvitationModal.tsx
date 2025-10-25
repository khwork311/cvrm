import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useInviteCustomer } from '../hooks/useCustomers';
import { getInviteCustomerSchema, InviteCustomerFormData } from '../schemas';

interface InvitationModalProps {
  onClose: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ onClose }) => {
  const { t } = useTranslation(['customers', 'common']);
  const { user } = useAuth();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);
  const toast = useToast();

  const { trigger: inviteTrigger, isMutating: isSubmitting } = useInviteCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteCustomerFormData>({
    resolver: zodResolver(getInviteCustomerSchema()),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: InviteCustomerFormData) => {
    try {
      setApiErrors(null);

      const inviteData = {
        company_id: user?.company_id!,
        email: data.email,
      };

      await inviteTrigger(inviteData);
      onClose();
      toast.success(t('customers:inviteSuccess'));
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { errors?: Record<string, string[]>; message: string } } };
      if (apiError?.response?.data?.errors) {
        setApiErrors(apiError.response.data.errors);
        toast.error(apiError.response.data.message);
      } else if (apiError?.response?.data?.message) {
        toast.error(apiError.response.data.message);
      } else {
        const errorMessage = t('customers:inviteError');
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white/90">{t('customers:inviteCustomer')}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* API Error Summary */}
        {apiErrors && Object.keys(apiErrors).length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{t('common:validationError')}</h3>
                <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                  {Object.entries(apiErrors).map(([field, messages]) =>
                    messages.map((message, idx) => (
                      <li key={`${field}-${idx}`} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400"></span>
                        <span>
                          <strong className="font-medium">{field}:</strong> {message}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {t('customers:email')} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="customer@example.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white/90"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button disabled={isSubmitting}>{isSubmitting ? t('customers:sending') : t('customers:send')}</Button>
        </div>
      </form>
    </Modal>
  );
};
