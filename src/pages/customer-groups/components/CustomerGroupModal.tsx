import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CustomerGroup } from '../api';
import { useCreateCustomerGroup, useUpdateCustomerGroup } from '../hooks';
import { CustomerGroupFormData, getCustomerGroupSchema } from '../schemas';

interface CustomerGroupModalProps {
  group: CustomerGroup | null;
  onClose: () => void;
  onSave: () => void;
}

export const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({ group, onClose, onSave }) => {
  const { t } = useTranslation(['customerGroups', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);
  const toast = useToast();
  const { user } = useAuth();

  const { trigger: createTrigger } = useCreateCustomerGroup();
  const { trigger: updateTrigger } = useUpdateCustomerGroup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerGroupFormData>({
    resolver: zodResolver(getCustomerGroupSchema()),
    defaultValues: {
      company_id: user?.company_id,
      name_en: group?.name_en || '',
      name_ar: group?.name_ar || '',
    },
  });

  const onSubmit = async (data: CustomerGroupFormData) => {
    try {
      setIsSubmitting(true);
      setApiErrors(null); // Clear previous errors

      if (group) {
        // Update existing group
        await updateTrigger({ id: group.id, data });
        toast.success(t('customerGroups:updateSuccess', 'Customer group updated successfully'));
      } else {
        // Create new group
        await createTrigger({ ...data, status: 0 } as any);
        toast.success(t('customerGroups:createSuccess', 'Customer group created successfully'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving customer group:', error);

      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
        toast.error(t('common:validationError', 'Please fix the errors below'));
      } else if (error?.response?.data?.message) {
        // Handle single error message
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        const errorMessage = group
          ? t('customerGroups:updateError', 'Failed to update customer group')
          : t('customerGroups:createError', 'Failed to create customer group');
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {group
            ? t('customerGroups:updateGroup', 'Edit Customer Group')
            : t('customerGroups:createNew', 'Create Customer Group')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    {t('common:validationError', 'Please fix the following errors:')}
                  </h3>
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name EN */}
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customerGroups:groupNameEn')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_en')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_en && <p className="mt-1 text-xs text-red-500">{errors.name_en.message}</p>}
            </div>

            {/* Name AR */}
            <div>
              <label htmlFor="name_ar" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customerGroups:groupNameAr')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_ar && <p className="mt-1 text-xs text-red-500">{errors.name_ar.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t('common:saving', 'Saving...')
                : group
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
