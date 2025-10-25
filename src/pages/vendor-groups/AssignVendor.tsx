import PageMeta from '@/components/common/PageMeta';
import Select from '@/components/form/Select';
import { FormButtons } from '@/components/ui/FormButtons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAssignVendors, useVendorGroups, useVendors } from './hooks';
import { getVendorAssignmentSchema, type VendorAssignmentFormData } from './schemas';

interface Option {
  value: string;
  label: string;
}

export const AssignVendor: React.FC = () => {
  const { t } = useTranslation(['vendorGroups', 'common']);
  const navigate = useNavigate();

  // Fetch data with SWR
  const { data: groupsData, isLoading: isLoadingGroups } = useVendorGroups();
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendors();
  const { trigger: assignVendor, isMutating: isAssigning } = useAssignVendors();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorAssignmentFormData>({
    resolver: zodResolver(getVendorAssignmentSchema()),
    defaultValues: {
      vendor_group_id: '',
      vendor_id: '',
    },
  });

  // Transform data to dropdown options
  const groupOptions: Option[] = useMemo(() => {
    const groups = groupsData?.data?.data || [];
    return groups.map((group) => ({
      value: group.id.toString(),
      label: group.name_en,
    }));
  }, [groupsData]);

  const vendorOptions: Option[] = useMemo(() => {
    const vendors = vendorsData?.data?.data || [];
    return vendors.map((vendor) => ({
      value: vendor.id.toString(),
      label: vendor.name_en,
    }));
  }, [vendorsData]);

  const onSubmit = async (data: VendorAssignmentFormData) => {
    try {
      await assignVendor({
        groupId: parseInt(data.vendor_group_id),
        vendorIds: [parseInt(data.vendor_id)],
      });
      navigate('/vendor-groups');
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = isLoadingGroups || isLoadingVendors;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={t('vendorGroups:assignVendor')} description={t('vendorGroups:assignVendor')} />

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            {t('vendorGroups:assignVendor')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Assignment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('vendorGroups:assignmentDetails')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Vendor Group Selection */}
                <div>
                  <label
                    htmlFor="vendor_group_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {t('vendorGroups:vendorGroup')} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="vendor_group_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={groupOptions}
                        placeholder={t('vendorGroups:selectGroup')}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.vendor_group_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.vendor_group_id.message}</p>
                  )}
                </div>

                {/* Vendor Selection */}
                <div>
                  <label
                    htmlFor="vendor_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {t('vendorGroups:vendor')} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="vendor_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={vendorOptions}
                        placeholder={t('vendorGroups:selectVendor')}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.vendor_id && <p className="mt-1 text-xs text-red-500">{errors.vendor_id.message}</p>}
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
                    <p className="font-medium">{t('vendorGroups:assignmentInfo')}</p>
                    <p className="mt-1">{t('vendorGroups:assignmentDescription')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <FormButtons
              onCancel={() => navigate('/vendor-groups')}
              submitText={t('vendorGroups:assignVendorBtn')}
              loadingText={t('vendorGroups:assigning')}
              isSubmitting={isAssigning}
            />
          </form>
        </div>
      </div>
    </>
  );
};
