import PageMeta from '@/components/common/PageMeta';
import { Input } from '@/components/form/Input';
import { FormButtons } from '@/components/ui/FormButtons';
import { useToast } from '@/context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateCustomerGroup, useCustomerGroup, useUpdateCustomerGroup } from './hooks';
import { getCustomerGroupSchema, type CustomerGroupFormData } from './schemas';

export const CreateCustomerGroup: React.FC = () => {
  const { t } = useTranslation(['customerGroups', 'common']);
  const navigate = useNavigate();
  const toast = useToast();
  const { groupId } = useParams<{ groupId: string }>();
  const isEditMode = !!groupId;

  // Fetch existing group data in edit mode
  const { data: existingGroup, isLoading } = useCustomerGroup(groupId ? parseInt(groupId) : null);
  const { trigger: createGroup, isMutating: isCreating } = useCreateCustomerGroup();
  const { trigger: updateGroup, isMutating: isUpdating } = useUpdateCustomerGroup();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerGroupFormData>({
    resolver: zodResolver(getCustomerGroupSchema()),
    defaultValues: {
      company_id: 1,
      name_en: existingGroup?.data?.name_en || '',
      name_ar: existingGroup?.data?.name_ar || '',
    },
  });

  // Update form when group data is loaded
  React.useEffect(() => {
    if (existingGroup) {
      reset({
        company_id: 1,
        name_en: existingGroup?.data?.name_en,
        name_ar: existingGroup?.data?.name_ar,
      });
    }
  }, [existingGroup, reset]);

  const onSubmit = async (data: CustomerGroupFormData) => {
    try {
      if (isEditMode && groupId) {
        await updateGroup({ id: parseInt(groupId), data });
        toast.success(t('customerGroups:updateSuccess', 'Customer group updated successfully'));
      } else {
        await createGroup(data as any);
        toast.success(t('customerGroups:createSuccess', 'Customer group created successfully'));
      }
      navigate('/customer-groups');
    } catch (error) {
      console.error(error);
      const errorMessage = isEditMode
        ? t('customerGroups:updateError', 'Failed to update customer group')
        : t('customerGroups:createError', 'Failed to create customer group');
      toast.error(errorMessage);
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
        title={t(isEditMode ? 'customerGroups:updateGroup' : 'customerGroups:createNew')}
        description={t(isEditMode ? 'customerGroups:updateGroup' : 'customerGroups:createNew')}
      />

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            {t(isEditMode ? 'customerGroups:updateGroup' : 'customerGroups:createNew')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Group Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('customerGroups:groupInformation')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <Input
                  {...register('name_en')}
                  id="name_en"
                  label={t('customerGroups:groupNameEn')}
                  placeholder={t('customerGroups:groupNameEn')}
                  error={errors.name_en?.message}
                  required
                />

                {/* Name AR */}
                <Input
                  {...register('name_ar')}
                  id="name_ar"
                  label={t('customerGroups:groupNameAr')}
                  placeholder={t('customerGroups:groupNameAr')}
                  dir="rtl"
                  error={errors.name_ar?.message}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <FormButtons
              onCancel={() => navigate('/customer-groups')}
              submitText={t(isEditMode ? 'customerGroups:updateGroupBtn' : 'customerGroups:createGroup')}
              loadingText={t('customerGroups:saving')}
              isSubmitting={isPending}
            />
          </form>
        </div>
      </div>
    </>
  );
};
