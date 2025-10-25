import Select from '@/components/form/Select';
import { useToast } from '@/context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useVendorGroups } from '../../vendor-groups/hooks/useVendorGroups';
import { Vendor } from '../api';
import { useCreateVendor, useUpdateVendor } from '../hooks';
import { VendorFormData, vendorSchema } from '../schemas';

interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: () => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({ vendor, onClose, onSave }) => {
  const { t, i18n } = useTranslation(['vendors', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { trigger: createTrigger } = useCreateVendor();
  const { trigger: updateTrigger } = useUpdateVendor();
  const { data: vendorGroupsData } = useVendorGroups();

  const vendorGroups = vendorGroupsData?.data?.data || [];
  const groupOptions = vendorGroups.map((group) => ({
    value: String(group.id),
    label: i18n.language === 'ar' ? group.name_ar : group.name_en,
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name_en: vendor?.name_en || '',
      name_ar: vendor?.name_ar || '',
      phone_number: vendor?.phone_number || '',
      email: vendor?.email || '',
      tax_number: vendor?.tax_number || '',
      status: vendor?.status ?? 1,
      role_id: 4, // Vendor role ID
      group_ids: vendor?.groups?.map((g: any) => g.id) || [],
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      setIsSubmitting(true);

      const apiData = {
        name_en: data.name_en,
        name_ar: data.name_ar || '',
        email: data.email,
        phone_number: data.phone_number,
        tax_number: data.tax_number || '',
        status: Number(data.status), // Convert to number for API
        role_id: data.role_id || 4, // Default to vendor role (4)
        group_ids: data.group_ids || [],
      };

      if (vendor) {
        await updateTrigger({ id: vendor.id, data: apiData });
        toast.success(t('vendors:updateSuccess', 'Vendor updated successfully'));
      } else {
        await createTrigger(apiData);
        toast.success(t('vendors:createSuccess', 'Vendor created successfully'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving vendor:', error);

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(errorMessages);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = vendor
          ? t('vendors:updateError', 'Failed to update vendor')
          : t('vendors:createError', 'Failed to create vendor');
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
          {vendor ? t('vendors:editVendor') : t('vendors:createVendor')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name EN */}
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:nameEn')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_en')}
                type="text"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_en && <p className="mt-1 text-xs text-red-500">{errors.name_en.message}</p>}
            </div>

            {/* Name AR */}
            <div>
              <label htmlFor="name_ar" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:nameAr')}
              </label>
              <input
                {...register('name_ar')}
                type="text"
                dir="rtl"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_ar && <p className="mt-1 text-xs text-red-500">{errors.name_ar.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:email')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                {t('vendors:phoneNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone_number')}
                type="tel"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>}
            </div>

            {/* Tax Number */}
            <div>
              <label htmlFor="tax_number" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:taxNumber')}
              </label>
              <input
                {...register('tax_number')}
                type="text"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.tax_number && <p className="mt-1 text-xs text-red-500">{errors.tax_number.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('common:status')}
              </label>
              <select
                {...register('status', { valueAsNumber: true })}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="1">{t('common:active')}</option>
                <option value="0">{t('common:inactive')}</option>
              </select>
              {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
            </div>

            {/* Vendor Groups */}
            <div className="md:col-span-2">
              <label htmlFor="group_ids" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:vendorGroups')}
              </label>
              <Controller
                name="group_ids"
                control={control}
                render={({ field }) => (
                  <Select
                    options={groupOptions}
                    placeholder={t('vendors:selectGroups', 'Select vendor groups')}
                    onChange={(value) => {
                      // Handle multiple selection by converting comma-separated string to array
                      const ids = value ? value.split(',').map(Number) : [];
                      field.onChange(ids);
                    }}
                    defaultValue={vendor?.groups?.map((g: any) => String(g.id)).join(',') || ''}
                    className="dark:bg-gray-900"
                  />
                )}
              />
              {errors.group_ids && <p className="mt-1 text-xs text-red-500">{errors.group_ids.message}</p>}
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
              className="flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t('common:saving', 'Saving...')
                : vendor
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
