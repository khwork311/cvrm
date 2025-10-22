import PageMeta from '@/components/common/PageMeta';
import Select from '@/components/form/Select';
import { FormButtons } from '@/components/ui/FormButtons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAttachCustomers, useCustomerGroups, useCustomers } from './hooks';
import { getCustomerAssignmentSchema, type CustomerAssignmentFormData } from './schemas';
import { useToast } from '@/context/ToastContext';

interface Option {
  value: string;
  label: string;
}

export const AssignCustomer: React.FC = () => {
  const { t } = useTranslation(['customerGroups', 'common']);
  const navigate = useNavigate();
  const toast = useToast();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);

  // Fetch data with SWR
  const { data: groupsData, isLoading: isLoadingGroups, error: groupsError } = useCustomerGroups();
  const { data: customersData, isLoading: isLoadingCustomers, error: customersError } = useCustomers();
  const { trigger: attachCustomers, isMutating: isAssigning } = useAttachCustomers();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerAssignmentFormData>({
    resolver: zodResolver(getCustomerAssignmentSchema()),
    defaultValues: {
      customer_group_id: '',
      customer_id: '',
    },
  });

  // Use dummy data on error or if no data available
  const shouldShowDummyGroups = groupsError || (!isLoadingGroups && !groupsData);
  const shouldShowDummyCustomers = customersError || (!isLoadingCustomers && !customersData);

  // Transform data to dropdown options
  const groupOptions: Option[] = useMemo(() => {
    const groups = groupsData?.data?.data || [];
    return groups.map((group: { id: { toString: () => any }; name_en: any }) => ({
      value: group.id.toString(),
      label: group.name_en,
    }));
  }, [groupsData, shouldShowDummyGroups]);

  const customerOptions: Option[] = useMemo(() => {
    const customers = customersData?.data?.data || [];
    return customers.map((customer: { id: { toString: () => any }; name_en: any }) => ({
      value: customer.id.toString(),
      label: customer.name_en,
    }));
  }, [customersData, shouldShowDummyCustomers]);

  const onSubmit = async (data: CustomerAssignmentFormData) => {
    try {
      setApiErrors(null); // Clear previous errors
      await attachCustomers({
        groupId: parseInt(data.customer_group_id),
        customerIds: [parseInt(data.customer_id)],
      });
      toast.success(t('customerGroups:assignSuccess', 'Customer assigned to group successfully'));
      navigate('/customer-groups');
    } catch (error: any) {
      console.error(error);
      
      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
        toast.error(t('common:validationError', 'Please fix the errors below'));
      } else if (error?.response?.data?.message) {
        // Handle single error message
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        toast.error(t('customerGroups:assignError', 'Failed to assign customer to group'));
      }
    }
  };

  const isLoading = isLoadingGroups || isLoadingCustomers;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={t('customerGroups:assignCustomer')} description={t('customerGroups:assignCustomer')} />

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            {t('customerGroups:assignCustomer')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* API Error Summary */}
            {apiErrors && Object.keys(apiErrors).length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                      {t('common:validationError', 'Please fix the following errors:')}
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                      {Object.entries(apiErrors).map(([field, messages]) => (
                        messages.map((message, idx) => (
                          <li key={`${field}-${idx}`} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400"></span>
                            <span><strong className="font-medium">{field}:</strong> {message}</span>
                          </li>
                        ))
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('customerGroups:assignmentDetails')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Customer Group Selection */}
                <div>
                  <label
                    htmlFor="customer_group_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {t('customerGroups:customerGroup')} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="customer_group_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={groupOptions}
                        placeholder={t('customerGroups:selectGroup')}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.customer_group_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.customer_group_id.message}</p>
                  )}
                </div>

                {/* Customer Selection */}
                <div>
                  <label
                    htmlFor="customer_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {t('customerGroups:customer')} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="customer_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={customerOptions}
                        placeholder={t('customerGroups:selectCustomer')}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.customer_id && <p className="mt-1 text-xs text-red-500">{errors.customer_id.message}</p>}
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium">{t('customerGroups:assignmentInfo')}</p>
                    <p className="mt-1">{t('customerGroups:assignmentDescription')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <FormButtons
              onCancel={() => navigate('/customer-groups')}
              submitText={t('customerGroups:assignCustomerBtn')}
              loadingText={t('customerGroups:assigning')}
              isSubmitting={isAssigning}
            />
          </form>
        </div>
      </div>
    </>
  );
};
