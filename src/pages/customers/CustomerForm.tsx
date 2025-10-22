import PageMeta from '@/components/common/PageMeta';
import { Input } from '@/components/form';
import { FormButtons } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateCustomer, useCustomer, useUpdateCustomer } from './hooks/useCustomers';
import { getCustomerSchema, type CustomerFormData } from './schemas';

export const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const { t } = useTranslation(['customers', 'common']);
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?.id ?? 1;
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);

  const isEditMode = !!customerId;

  const {
    data: customer,
    isLoading: isFetching,
    error: fetchError,
  } = useCustomer(isEditMode && customerId ? Number(customerId) : null);
  // const { data: customerGroups } = useCustomerGroups();
  const { trigger: createTrigger, isMutating: isCreating } = useCreateCustomer();
  const { trigger: updateTrigger, isMutating: isUpdating } = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(getCustomerSchema()),
    defaultValues: {
      name_en: customer?.data?.name_en || '',
      name_ar: customer?.data?.name_ar || '',
      phone_number: customer?.data?.phone_number || '',
      email: customer?.data?.email || customer?.data?.user?.email || '',
      tax_number: customer?.data?.tax_number || '',
      // password: customer?.data?.user?.password || '',
      // confirm_password: customer?.data?.user?.password || '',
      customer_group_id: customer?.data?.customer_group_id || 1,
    },
  });

  useEffect(() => {
    if (customer?.data) {
      reset({
        name_en: customer.data.name_en,
        name_ar: customer.data.name_ar,
        phone_number: customer.data.phone_number,
        email: customer.data.email || customer.data.user?.email,
        tax_number: customer.data.tax_number,
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setApiErrors(null); // Clear previous errors
      if (isEditMode && customerId) {
        // Update existing customer - only send update fields
        const updateData = {
          company_id: customer?.data?.company_id || 1,
          name_en: data.name_en,
          name_ar: data.name_ar,
          phone_number: data.phone_number,
          email: data.email,
          tax_number: data.tax_number,
          role_id: customer?.data?.user?.role?.id || 3,
          name: data.name_en, // User name
          // password: data.password, // Only include if updating password
        };
        await updateTrigger({ id: Number(customerId), data: updateData });
        toast.success(t('customers:updateSuccess'));
      } else {
        // Create new customer - include all required fields
        const createData = {
          company_id: userId,
          role_id: 3,
          name: data.name_en,
          password: '123456', // Default password - should be changed by user
          name_en: data.name_en,
          name_ar: data.name_ar,
          phone_number: data.phone_number,
          email: data.email,
          tax_number: data.tax_number,
          group_id: data.customer_group_id,
          status: 1, // Active by default
        };
        await createTrigger(createData);
        toast.success(t('customers:createSuccess'));
      }
      navigate('/customers');
    } catch (error: any) {
      console.error('Error saving customer:', error);
      
      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
        toast.error(t('common:validationError', 'Please fix the errors below'));
      } else if (error?.response?.data?.message) {
        // Handle single error message
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        const errorMessage = isEditMode ? t('customers:updateError') : t('customers:createError');
        toast.error(errorMessage);
      }
    }
  };

  const isPending = isSubmitting || isCreating || isUpdating;

  const handleCancel = () => {
    navigate('/customers');
  };

  // Handle loading state
  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  // Handle error state
  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 dark:text-red-400">{t('customers:fetchError')}</div>
          <button
            onClick={() => navigate('/customers')}
            className="mt-4 text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('common:goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={isEditMode ? t('customers:editCustomer') : t('customers:createNew')}
        description={isEditMode ? 'Edit customer details' : 'Create a new customer'}
      />

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            {isEditMode ? t('customers:editCustomer') : t('customers:createNew')}
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

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('customers:customerDetails')}</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <Input
                  {...register('name_en')}
                  id="name_en"
                  label={t('customers:nameEn')}
                  type="text"
                  placeholder={t('common:enterCustomerName')}
                  error={errors.name_en?.message}
                  required
                />

                {/* Name AR */}
                <Input
                  {...register('name_ar')}
                  id="name_ar"
                  label={t('customers:nameAr')}
                  type="text"
                  placeholder={t('common:enterCustomerName')}
                  dir="rtl"
                  error={errors.name_ar?.message}
                  required
                />

                {/* Phone Number */}
                <Input
                  {...register('phone_number')}
                  id="phone_number"
                  label={t('customers:phoneNumber')}
                  type="tel"
                  placeholder="+966501234567"
                  error={errors.phone_number?.message}
                  required
                />

                {/* Email */}
                <Input
                  {...register('email')}
                  id="email"
                  label={t('customers:email')}
                  type="email"
                  placeholder="customer@example.com"
                  error={errors.email?.message}
                  required
                />

                {/* Tax Number */}
                <Input
                  {...register('tax_number')}
                  id="tax_number"
                  label={t('common:taxNumber')}
                  type="text"
                  placeholder={t('common:enterTaxNumber')}
                  error={errors.tax_number?.message}
                  required
                />

                {/* password */}
                {/* <Input
                  {...register('password')}
                  id="password"
                  label={t('customers:password')}
                  type="password"
                  placeholder="Enter password"
                  error={errors.password?.message}
                  required
                /> */}
                {/* confirm password */}
                {/* <Input
                  {...register('confirm_password')}
                  id="confirm_password"
                  label={t('customers:confirmPassword')}
                  type="password"
                  placeholder="Confirm password"
                  error={errors.confirm_password?.message}
                  required
                /> */}

                {/* customer group */}
                {/* <Select
                  {...register('customer_group_id')}
                  id="customer_group_id"
                  label={t('customers:customerGroup')}
                  options={customerGroups}
                  error={errors.customer_group_id?.message}
                  required
                /> */}
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <FormButtons
                onCancel={handleCancel}
                submitText={t('common:save')}
                cancelText={t('common:cancel')}
                isSubmitting={isPending}
                loadingText={t('common:loading')}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
