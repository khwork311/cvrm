import PageMeta from '@/components/common/PageMeta';
import { Input, Select } from '@/components/form';
import { FormButtons } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlansDropdown } from '../plans/hooks/usePlans';
import { useCompany, useCreateCompany, useUpdateCompany } from './hooks/useCompanies';
import { getCompanySchema, type CompanyFormData } from './schemas';

export interface Option {
  value: string;
  label: string;
}

export const CreateCompany: React.FC = () => {
  const { t, i18n } = useTranslation(['companies', 'common']);
  const { companyId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: company } = useCompany(companyId ? Number(companyId) : null);
  const { trigger: createTrigger, isMutating: isCreating } = useCreateCompany();
  const { trigger: updateTrigger, isMutating: isUpdating } = useUpdateCompany();
  const { data } = usePlansDropdown();
  type Plan = { id: number | string; title_ar: string; title_en: string };
  const planOptions: Option[] =
    data?.data?.map((plan: Plan) => ({
      value: String(plan.id),
      label: plan.title_en,
    })) || [];

  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(getCompanySchema(!!companyId)),
    defaultValues: {
      name_en: '',
      name_ar: '',
      vat_number: '',
      telephone_number: '',
      mobile_number: '',
      email: '',
      website_url: '',
      main_account_number: '',
      sub_account_number: '',
      subscription_start_date: '',
      subscription_end_date: '',
      plan_id: '',
      contact_first_name_en: '',
      contact_first_name_ar: '',
      contact_last_name_en: '',
      contact_last_name_ar: '',
      contact_email: '',
      contact_position: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    if (company?.data) {
      reset({
        name_en: company.data.name_en || '',
        name_ar: company.data.name_ar || '',
        vat_number: company.data.vat_number || '',
        telephone_number: company.data.telephone_number || '',
        mobile_number: company.data.mobile_number || '',
        email: company.data.email || '',
        website_url: company.data.website_url || '',
        main_account_number: company.data.main_account_number || '',
        sub_account_number: company.data.sub_account_number || '',
        subscription_start_date: company.data.subscription_start_date || '',
        subscription_end_date: company.data.subscription_end_date || '',
        plan_id: String(company.data.plan_id) || '1',
        contact_first_name_en: '',
        contact_first_name_ar: '',
        contact_last_name_en: '',
        contact_last_name_ar: '',
        contact_email: '',
        contact_position: '',
      });
    }
  }, [company, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const {
        contact_first_name_en,
        contact_first_name_ar,
        contact_last_name_en,
        contact_last_name_ar,
        contact_email,
        contact_position,
        ...companyData
      } = data;

      // Create FormData for file upload
      const apiFormData = new FormData();

      // Add company data
      Object.entries(companyData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          apiFormData.append(key, String(value));
        }
      });

      // Add attachments - append each file individually
      attachments.forEach((file) => {
        apiFormData.append('attachments[]', file);
      });

      if (companyId) {
        // UPDATE: Don't include contact person fields
        await updateTrigger({ id: Number(companyId), data: apiFormData });
        toast.success(t('companies:updateSuccess', 'Company updated successfully'));
      } else {
        // CREATE: Include contact person data
        if (contact_first_name_en) apiFormData.append('first_name_en', contact_first_name_en);
        if (contact_first_name_ar) apiFormData.append('first_name_ar', contact_first_name_ar);
        if (contact_last_name_en) apiFormData.append('last_name_en', contact_last_name_en);
        if (contact_last_name_ar) apiFormData.append('last_name_ar', contact_last_name_ar);
        if (contact_email) apiFormData.append('contact_email', contact_email);

        if (contact_position) {
          apiFormData.append('position', contact_position);
        }

        await createTrigger(apiFormData);
        toast.success(t('companies:createSuccess', 'Company created successfully'));
      }

      navigate('/companies');
    } catch (error: unknown) {
      console.error(`Error ${companyId ? 'updating' : 'creating'} company:`, error);
      toast.error(
        companyId
          ? t('companies:updateError', 'Failed to update company')
          : t('companies:createError', 'Failed to create company')
      );
    }
  };

  const isPending = isSubmitting || isCreating || isUpdating;

  return (
    <>
      <PageMeta title={t('companies:createNew')} description={t('companies:createNew')} />

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
            {companyId ? t('companies:editCompany', 'Edit Company') : t('companies:createNew')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('companies:basicInformation')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <Input
                  {...register('name_en')}
                  id="name_en"
                  label={t('companies:companyName')}
                  type="text"
                  placeholder={t('companies:enterCompanyName')}
                  error={errors.name_en?.message}
                  required
                />

                {/* Name AR */}
                <Input
                  {...register('name_ar')}
                  id="name_ar"
                  label={t('companies:companyName')}
                  type="text"
                  placeholder={t('companies:enterCompanyName')}
                  dir="rtl"
                  error={errors.name_ar?.message}
                  required
                />

                {/* VAT Number */}
                <Input
                  {...register('vat_number')}
                  id="vat_number"
                  label={t('companies:vatNumber')}
                  type="text"
                  placeholder={t('companies:enterVatNumber')}
                  error={errors.vat_number?.message}
                  required
                />

                {/* Plan */}
                <div>
                  <label
                    htmlFor="plan_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {t('companies:plan')} <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="plan_id"
                    control={control}
                    defaultValue={String(company?.data?.plan?.[`title_${i18n?.language}` as 'title_en' | 'title_ar'])}
                    render={({ field }) => (
                      <>
                        <Select
                          id="plan_id"
                          options={planOptions}
                          placeholder={t('companies:selectPlan')}
                          onChange={field.onChange}
                          defaultValue={field.value}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('companies:contactInformation')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Email */}
                <Input
                  {...register('email')}
                  id="email"
                  label={t('companies:email')}
                  type="email"
                  placeholder="company@example.com"
                  error={errors.email?.message}
                />

                {/* Telephone */}
                <Input
                  {...register('telephone_number')}
                  id="telephone_number"
                  label={t('companies:telephoneNumber')}
                  type="tel"
                  placeholder="+966112345678"
                  error={errors.telephone_number?.message}
                />

                {/* Mobile */}
                <Input
                  {...register('mobile_number')}
                  id="mobile_number"
                  label={t('companies:mobileNumber')}
                  type="tel"
                  placeholder="+966501234567"
                  error={errors.mobile_number?.message}
                />

                {/* Website */}
                <Input
                  {...register('website_url')}
                  id="website_url"
                  label={t('companies:websiteUrl')}
                  type="url"
                  placeholder="https://example.com"
                  error={errors.website_url?.message}
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('companies:accountInformation')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Main Account Number */}
                <Input
                  {...register('main_account_number')}
                  id="main_account_number"
                  label={t('companies:mainAccountNumber')}
                  type="text"
                  placeholder={t('companies:enterMainAccountNumber')}
                  error={errors.main_account_number?.message}
                />

                {/* Sub Account Number */}
                <Input
                  {...register('sub_account_number')}
                  id="sub_account_number"
                  label={t('companies:subAccountNumber')}
                  type="text"
                  placeholder={t('companies:enterSubAccountNumber')}
                  error={errors.sub_account_number?.message}
                />
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('companies:subscriptionInformation')}
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Start Date */}
                <Input
                  {...register('subscription_start_date')}
                  id="subscription_start_date"
                  label={t('companies:subscriptionStartDate')}
                  type="date"
                  error={errors.subscription_start_date?.message}
                />

                {/* End Date */}
                <Input
                  {...register('subscription_end_date')}
                  id="subscription_end_date"
                  label={t('companies:subscriptionEndDate')}
                  type="date"
                  error={errors.subscription_end_date?.message}
                />
              </div>
            </div>

            {/* Contact Person Information - Only show for create */}
            {!companyId && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t('companies:contactPersonInformation')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('companies:contactPersonDescription')}</p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Contact First Name EN */}
                  <Input
                    {...register('contact_first_name_en')}
                    id="contact_first_name_en"
                    label={t('common:firstNameEn')}
                    type="text"
                    placeholder={t('common:enterFirstName')}
                    error={errors.contact_first_name_en?.message}
                    required
                  />

                  {/* Contact First Name AR */}
                  <Input
                    {...register('contact_first_name_ar')}
                    id="contact_first_name_ar"
                    label={t('common:firstNameAr')}
                    type="text"
                    placeholder={t('common:enterFirstName')}
                    dir="rtl"
                    error={errors.contact_first_name_ar?.message}
                    required
                  />

                  {/* Contact Last Name EN */}
                  <Input
                    {...register('contact_last_name_en')}
                    id="contact_last_name_en"
                    label={t('common:lastNameEn')}
                    type="text"
                    placeholder={t('common:enterLastName')}
                    error={errors.contact_last_name_en?.message}
                    required
                  />

                  {/* Contact Last Name AR */}
                  <Input
                    {...register('contact_last_name_ar')}
                    id="contact_last_name_ar"
                    label={t('common:lastNameAr')}
                    type="text"
                    placeholder={t('common:enterLastName')}
                    dir="rtl"
                    error={errors.contact_last_name_ar?.message}
                    required
                  />

                  {/* Contact Email */}
                  <Input
                    {...register('contact_email')}
                    id="contact_email"
                    label={t('common:email')}
                    type="email"
                    placeholder="contact@example.com"
                    error={errors.contact_email?.message}
                    required
                  />

                  {/* Contact Position */}
                  <Input
                    {...register('contact_position')}
                    id="contact_position"
                    label={t('common:position')}
                    type="text"
                    placeholder={t('common:enterPosition')}
                    error={errors.contact_position?.message}
                  />
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('companies:attachments')}</h3>

              <div>
                <label
                  htmlFor="attachments"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  {t('companies:uploadFiles')}
                </label>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {attachments.length} {t('common:filesSelected', 'file(s) selected')}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <FormButtons
              onCancel={() => navigate('/companies')}
              submitText={companyId ? t('companies:updateCompany', 'Update Company') : t('companies:createCompany')}
              cancelText={t('common:cancel')}
              isSubmitting={isPending}
              loadingText={companyId ? t('common:updating', 'Updating...') : t('common:creating', 'Creating...')}
            />
          </form>
        </div>
      </div>
    </>
  );
};
