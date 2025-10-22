import { Select } from '@/components/form';
import { Input } from '@/components/form/Input';
import { FormButtons } from '@/components/ui/FormButtons';
import { SectionLoading } from '@/components/ui/loading/SectionLoading';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getUserSchema, type UserFormData } from './schemas';

// Mock roles data - replace with actual API call
const ROLES = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Manager' },
  { id: 4, name: 'Viewer' },
];

interface UserFormProps {
  mode: 'create' | 'update';
  initialData?: {
    name: string;
    email: string;
    role_id: number;
  };
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isLoading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(getUserSchema(mode)),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role_id: 4,
    },
  });

  // Load initial data when provided
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        password: '',
        role_id: initialData.role_id, // to be changed (role.role_name or so)
      });
    }
  }, [initialData, reset]);

  // to be changed
  const roleOptions = ROLES.map((role) => ({
    value: role.id.toString(),
    label: role.name,
  }));

  const selectedRoleId = watch('role_id');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SectionLoading size="lg" text={t('common:loading')} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">{t('users:basicInformation')}</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Name */}
          <Input
            {...register('name')}
            id="name"
            label={t('users:form.name')}
            placeholder={t('users:form.namePlaceholder')}
            error={errors.name}
          />

          {/* Email */}
          <Input
            {...register('email')}
            id="email"
            label={t('users:form.email')}
            placeholder={t('users:form.emailPlaceholder')}
            error={errors.email}
          />
        </div>

        {/* Password - Only show in create mode */}
        {mode === 'create' && (
          <div className="mt-6">
            <Input
              {...register('password')}
              id="password"
              type="password"
              label={t('users:form.password')}
              placeholder={t('users:form.passwordPlaceholder')}
              error={errors.password}
              required
            />
          </div>
        )}
      </div>

      {/* Role Assignment Section */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">{t('users:roleAssignment')}</h3>

        <div className="max-w-md">
          <Select
            {...register('role_id')}
            id="role_id"
            label={t('users:form.role')}
            defaultValue={roleOptions[3].value}
            options={roleOptions}
            placeholder={t('users:form.rolePlaceholder')}
            onChange={(v) => {
              setValue('role_id', +v);
            }}
          />
          {errors.role_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.role_id.message}</p>}
        </div>

        {/* Role Description */}
        {selectedRoleId && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('users:roleDescription', {
                role: ROLES.find((role) => role.id === selectedRoleId)?.name,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <FormButtons
        onCancel={onCancel}
        submitText={mode === 'create' ? t('users:createUser') : t('users:updateUser')}
        cancelText={t('common:cancel')}
        loadingText={mode === 'create' ? t('common:creating') : t('common:updating')}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};
