import PageMeta from '@/components/common/PageMeta';
import { Input } from '@/components/form/Input';
import { FormButtons } from '@/components/ui/FormButtons';
import { useToast } from '@/context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateVendorGroup, useUpdateVendorGroup, useVendorGroup } from './hooks';
import { getVendorGroupSchema, type VendorGroupFormData } from './schemas';

export const VendorGroupForm: React.FC = () => {
  const { t } = useTranslation(['vendorGroups', 'common']);
  const navigate = useNavigate();
  const toast = useToast();
  const { groupId } = useParams<{ groupId: string }>();
  const isEditMode = !!groupId;

  // Fetch existing group data in edit mode
  const { data: groupResponse, isLoading } = useVendorGroup(groupId ? parseInt(groupId) : null);
  const existingGroup = groupResponse?.data;

  const { trigger: createGroup, isMutating: isCreating } = useCreateVendorGroup();
  const { trigger: updateGroup, isMutating: isUpdating } = useUpdateVendorGroup();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VendorGroupFormData>({
    resolver: zodResolver(getVendorGroupSchema()),
    defaultValues: {
      name_en: existingGroup?.name_en || '',
      name_ar: existingGroup?.name_ar || '',
      status: existingGroup?.status || 1,
    },
  });

  // Update form when group data is loaded
  React.useEffect(() => {
    if (existingGroup) {
      reset({
        name_en: existingGroup.name_en,
        name_ar: existingGroup.name_ar,
        status: existingGroup.status,
      });
    }
  }, [existingGroup, reset]);

  const onSubmit = async (data: VendorGroupFormData) => {
    try {
      if (isEditMode && groupId) {
        await updateGroup({ id: parseInt(groupId), data });
        toast.success(t('vendorGroups:updateSuccess', 'Vendor group updated successfully'));
      } else {
        await createGroup(data);
        toast.success(t('vendorGroups:createSuccess', 'Vendor group created successfully'));
      }
      navigate('/vendor-groups');
    } catch (error: any) {
      console.error(error);

      // Handle API validation errors
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(errorMessages);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = isEditMode
          ? t('vendorGroups:updateError', 'Failed to update vendor group')
          : t('vendorGroups:createError', 'Failed to create vendor group');
        toast.error(errorMessage);
      }
    }
  };

  const isPending = isSubmitting || isCreating || isUpdating;

  // Show loading state in edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={t(isEditMode ? 'vendorGroups:updateGroup' : 'vendorGroups:createNew')}
        description={t(isEditMode ? 'vendorGroups:updateGroup' : 'vendorGroups:createNew')}
      />

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            {t(isEditMode ? 'vendorGroups:updateGroup' : 'vendorGroups:createNew')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Group Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('vendorGroups:groupInformation')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <Input
                  {...register('name_en')}
                  id="name_en"
                  label={t('vendorGroups:groupNameEn')}
                  placeholder={t('vendorGroups:groupNameEn')}
                  error={errors.name_en?.message}
                  required
                />

                {/* Name AR */}
                <Input
                  {...register('name_ar')}
                  id="name_ar"
                  label={t('vendorGroups:groupNameAr')}
                  placeholder={t('vendorGroups:groupNameAr')}
                  dir="rtl"
                  error={errors.name_ar?.message}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <FormButtons
              onCancel={() => navigate('/vendor-groups')}
              submitText={t(isEditMode ? 'vendorGroups:updateGroupBtn' : 'vendorGroups:createGroup')}
              loadingText={t('vendorGroups:saving')}
              isSubmitting={isPending}
            />
          </form>
        </div>
      </div>
    </>
  );
};
