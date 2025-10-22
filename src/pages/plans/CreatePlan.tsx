import PageMeta from '@/components/common/PageMeta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/form/Input';
import { Textarea } from '../../components/form/Textarea';
import { FormButtons } from '../../components/ui/FormButtons';
import { useCreatePlan } from './hooks/usePlans';
import { getPlanSchema, type PlanFormData } from './schemas';

const CreatePlan: React.FC = () => {
  const { t } = useTranslation(['plans', 'common']);
  const navigate = useNavigate();
  const { trigger: createPlan, isMutating } = useCreatePlan();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(getPlanSchema()),
    defaultValues: {
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      users_limit: '',
      customers_limit: '',
      vendors_limit: '',
    },
  });

  const onSubmit = async (formData: PlanFormData) => {
    const data = getPlanSchema().parse(formData);
    try {
      await createPlan({
        title_en: data.title_en,
        title_ar: data.title_ar,
        description_en: data.description_en,
        description_ar: data.description_ar,
        users_limit: parseInt(data.users_limit),
        customers_limit: parseInt(data.customers_limit),
        vendors_limit: parseInt(data.vendors_limit),
        status: 0,
      });
      // show success toast here
      navigate('/plans');
    } catch (error) {
      console.error(error);
      // show error toast
    }
  };

  return (
    <>
      <PageMeta title={t('plans:createNewPlan')} description={t('plans:createNewPlan')} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">{t('plans:createNewPlan')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title EN */}
          <Input
            {...register('title_en')}
            id="title_en"
            label={t('plans:titleEn')}
            placeholder={t('plans:enterEnglishTitle')}
            error={errors.title_en}
          />

          {/* Title AR */}
          <Input
            {...register('title_ar')}
            id="title_ar"
            label={t('plans:titleAr')}
            placeholder={t('plans:enterArabicTitle')}
            dir="rtl"
            error={errors.title_ar}
          />

          {/* Description EN */}
          <Textarea
            {...register('description_en')}
            id="description_en"
            label={t('plans:descriptionEn')}
            rows={3}
            placeholder={t('plans:optionalEnglishDescription', 'Optional English description')}
          />

          {/* Description AR */}
          <Textarea
            {...register('description_ar')}
            id="description_ar"
            label={t('plans:descriptionAr')}
            rows={3}
            placeholder={t('plans:optionalArabicDescription', 'الوصف بالعربية (اختياري)')}
            dir="rtl"
          />

          {/* Numeric Limits */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Input
              {...register('users_limit')}
              id="users_limit"
              type="number"
              min={0}
              label={t('plans:usersLimit')}
              placeholder="0"
              error={errors.users_limit}
            />
            <Input
              {...register('customers_limit')}
              id="customers_limit"
              type="number"
              min={0}
              label={t('plans:customersLimit')}
              placeholder="0"
              error={errors.customers_limit}
            />
            <Input
              {...register('vendors_limit')}
              id="vendors_limit"
              type="number"
              min={0}
              label={t('plans:vendorsLimit')}
              placeholder="0"
              error={errors.vendors_limit}
            />
          </div>

          {/* Buttons */}
          <FormButtons
            onCancel={() => navigate('/plans')}
            submitText={t('plans:createPlan')}
            loadingText={t('plans:creating')}
            isSubmitting={isMutating}
          />
        </form>
      </div>
    </>
  );
};

export default CreatePlan;
