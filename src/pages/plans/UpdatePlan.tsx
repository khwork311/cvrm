import { useToast } from '@/context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import { Input } from '../../components/form/Input';
import { Textarea } from '../../components/form/Textarea';
import { FormButtons } from '../../components/ui/FormButtons';
import { usePlan, useUpdatePlan } from './hooks/usePlans';
import { getPlanSchema, type PlanFormData } from './schemas';

const UpdatePlan = () => {
  const { t } = useTranslation(['plans', 'common']);

  const { error, success } = useToast();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const planId = id ? parseInt(id) : null;

  const { data: existingPlan, isLoading } = usePlan(planId);
  const { trigger: updatePlan, isMutating } = useUpdatePlan();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(getPlanSchema()),
    defaultValues: {
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      users_limit: '0',
      customers_limit: '0',
      vendors_limit: '0',
    },
  });

  // Load existing data when fetched
  useEffect(() => {
    if (existingPlan) {
      reset({
        title_en: existingPlan.data.title_en,
        title_ar: existingPlan.data.title_ar,
        description_en: existingPlan.data.description_en || '',
        description_ar: existingPlan.data.description_ar || '',
        users_limit: existingPlan.data.users_limit?.toString() || '0',
        customers_limit: existingPlan.data.customers_limit?.toString() || '0',
        vendors_limit: '0',
      });
    }
  }, [existingPlan, reset]);

  const onSubmit = async (data: PlanFormData) => {
    if (!planId) return;

    try {
      await updatePlan({
        id: planId,
        data: {
          title_en: data.title_en,
          title_ar: data.title_ar,
          description_en: data.description_en,
          description_ar: data.description_ar,
          users_limit: parseInt(data.users_limit),
          customers_limit: parseInt(data.customers_limit),
          vendors_limit: parseInt(data.vendors_limit),
          status: existingPlan?.data.status!,
        },
      });
      success(t('plans:planUpdated'));
    } catch (err) {
      console.error(err);
      error(t('plans:planUpdateFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Update Plan | CVRM Dashboard" description="Update an existing plan for your system" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Update Plan</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-6">
          {/* Title EN */}
          <Input
            {...register('title_en')}
            id="title_en"
            label="Title (EN)"
            placeholder="Enter English title"
            error={errors.title_en}
          />

          {/* Title AR */}
          <Input
            {...register('title_ar')}
            id="title_ar"
            label="Title (AR)"
            placeholder="أدخل العنوان بالعربية"
            dir="rtl"
            error={errors.title_ar}
          />

          {/* Description EN */}
          <Textarea
            {...register('description_en')}
            id="description_en"
            label="Description (EN)"
            rows={3}
            placeholder="Optional English description"
          />

          {/* Description AR */}
          <Textarea
            {...register('description_ar')}
            id="description_ar"
            label="Description (AR)"
            rows={3}
            placeholder="الوصف بالعربية (اختياري)"
            dir="rtl"
          />

          {/* Numeric Limits */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Input
              {...register('users_limit')}
              id="users_limit"
              type="number"
              min={0}
              label="Users Limit"
              placeholder="0"
              error={errors.users_limit}
            />
            <Input
              {...register('customers_limit')}
              id="customers_limit"
              type="number"
              min={0}
              label="Customers Limit"
              placeholder="0"
              error={errors.customers_limit}
            />
            <Input
              {...register('vendors_limit')}
              id="vendors_limit"
              type="number"
              min={0}
              label="Vendors Limit"
              placeholder="0"
              error={errors.vendors_limit}
            />
          </div>

          {/* Buttons */}
          <FormButtons
            onCancel={() => navigate('/plans')}
            submitText="Update Plan"
            loadingText="Updating..."
            isSubmitting={isMutating}
          />
        </form>
      </div>
    </>
  );
};

export default UpdatePlan;
