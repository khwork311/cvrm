import React from 'react';
import PageMeta from '@/components/common/PageMeta';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateVendor, useUpdateVendor, useVendor } from './hooks';
import { vendorSchema, type VendorFormData } from './schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/context/ToastContext';

export const VendorForm = () => {
  const { t, ready } = useTranslation(['vendors', 'common', 'validation']);
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const isEditMode = !!vendorId;

  const toast = useToast();
  const { data: apiVendorResponse, isLoading: isLoadingVendor } = useVendor(vendorId ? parseInt(vendorId) : null);
  
  // Extract vendor data from API response
  const vendorData = apiVendorResponse?.data;
  
  const { trigger: createVendor, isMutating: isCreating } = useCreateVendor();
  const { trigger: updateVendor, isMutating: isUpdating } = useUpdateVendor();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name_en: vendorData?.name_en || '',
      name_ar: vendorData?.name_ar || '',
      phone_number: vendorData?.phone_number || '',
      email: vendorData?.email || '',
      tax_number: vendorData?.tax_number || '',
      status: vendorData?.status === 1 ? 'active' : 'inactive',
    },
  });

  // Update form when vendor data is loaded
  React.useEffect(() => {
    if (vendorData) {
      reset({
        name_en: vendorData.name_en,
        name_ar: vendorData.name_ar || '',
        phone_number: vendorData.phone_number,
        email: vendorData.email,
        tax_number: vendorData.tax_number || '',
        status: vendorData.status === 1 ? 'active' : 'inactive',
      });
    }
  }, [vendorData, reset]);

  const onSubmit = async (data: VendorFormData) => {
    try {
      // Convert status to number for API
      const apiData = {
        ...data,
        status: data.status === 'active' ? 1 : 0,
      };

      if (isEditMode && vendorId) {
        await updateVendor({ id: parseInt(vendorId), data: apiData });
        toast.success(t('vendors:updateSuccess', 'Vendor updated successfully'));
      } else {
        await createVendor(apiData);
        toast.success(t('vendors:createSuccess', 'Vendor created successfully'));
      }
      navigate('/vendors');
    } catch (error: any) {
      console.error('Failed to save vendor:', error);
      
      // Handle API validation errors
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(errorMessages);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = isEditMode 
          ? t('vendors:updateError', 'Failed to update vendor')
          : t('vendors:createError', 'Failed to create vendor');
        toast.error(errorMessage);
      }
    }
  };

  const isPending = isSubmitting || isCreating || isUpdating;

  const handleCancel = () => {
    if (isEditMode && vendorId) {
      navigate(`/vendors/${vendorId}`);
    } else {
      navigate('/vendors');
    }
  };


  if (!ready || (isEditMode && isLoadingVendor)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={ready ? (isEditMode ? t('vendors:editVendor') : t('vendors:createVendor')) : 'Vendor Form'}
        description={ready ? t('vendors:formDescription') : 'Create or edit vendor'}
      />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
            {isEditMode ? t('vendors:editVendor') : t('vendors:createVendor')}
          </h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name (English) */}
              <div>
                <label htmlFor="name_en" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:nameEn')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name_en')}
                  id="name_en"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                  required
                />
                {errors.name_en && <p className="mt-1 text-sm text-red-500">{errors.name_en.message}</p>}
              </div>

              {/* Name (Arabic) */}
              <div>
                <label htmlFor="name_ar" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:nameAr')}
                </label>
                <input
                  {...register('name_ar')}
                  id="name_ar"
                  type="text"
                  dir="rtl"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.name_ar && <p className="mt-1 text-sm text-red-500">{errors.name_ar.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:email')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone_number" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('phone_number')}
                  id="phone_number"
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                  required
                />
                {errors.phone_number && <p className="mt-1 text-sm text-red-500">{errors.phone_number.message}</p>}
              </div>

              {/* Tax Number */}
              <div>
                <label htmlFor="tax_number" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:taxNumber')}
                </label>
                <input
                  {...register('tax_number')}
                  id="tax_number"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.tax_number && <p className="mt-1 text-sm text-red-500">{errors.tax_number.message}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common:status')}
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                >
                  <option value="active">{t('common:active')}</option>
                  <option value="inactive">{t('common:inactive')}</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="text-red-500">*</span> {t('common:requiredFields')}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  )}
                  {isPending ? t('common:saving') : t('common:save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
