import { SectionLoading } from '@/components/ui/loading/SectionLoading';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/form/Input';
import { FormButtons } from '../../components/ui/FormButtons';
import { getRoleSchema, type RoleFormData } from './schemas';

// Mock permissions data - replace with actual API call
const PERMISSIONS = [
  { id: 'users.view', nameKey: 'users.view', resource: 'users' },
  { id: 'users.create', nameKey: 'users.create', resource: 'users' },
  { id: 'users.update', nameKey: 'users.update', resource: 'users' },
  { id: 'users.status.toggle', nameKey: 'users.status.toggle', resource: 'users' },
  { id: 'users.reset-password', nameKey: 'users.reset-password', resource: 'users' },
  { id: 'roles.view', nameKey: 'roles.view', resource: 'roles' },
  { id: 'roles.create', nameKey: 'roles.create', resource: 'roles' },
  { id: 'roles.update', nameKey: 'roles.update', resource: 'roles' },
  { id: 'permissions.view', nameKey: 'permissions.view', resource: 'permissions' },
  { id: 'permissions.assign', nameKey: 'permissions.assign', resource: 'permissions' },
  { id: 'dashboard.view', nameKey: 'dashboard.view', resource: 'dashboard' },
];

// Group permissions by resource
const groupedPermissions = PERMISSIONS.reduce(
  (acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  },
  {} as Record<string, typeof PERMISSIONS>
);

interface RoleFormProps {
  mode: 'create' | 'update';
  initialData?: {
    name: string;
    permissions?: string[];
  };
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isLoading = false,
}) => {
  const { t } = useTranslation(['roles', 'common']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(getRoleSchema()),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  // Load initial data when provided
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        permissions: initialData.permissions || [],
      });
    }
  }, [initialData, reset]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SectionLoading size="lg" text={t('common:loading')} />;
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role Name */}
      <Input
        {...register('name')}
        id="name"
        label={t('roles:roleName')}
        placeholder={t('roles:enterRoleName')}
        error={errors.name}
      />

      {/* Permissions - Grouped by Resource */}
      <div>
        <label className="mb-6 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {t('roles:permissions')}
        </label>

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
            <div key={resource} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 text-sm font-semibold text-gray-800 capitalize dark:text-white/90">
                {t(`roles:resources.${resource}`, { defaultValue: resource })}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {resourcePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center">
                    <input
                      {...register('permissions')}
                      type="checkbox"
                      value={permission.id}
                      id={`permission-${permission.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      htmlFor={`permission-${permission.id}`}
                      className="ms-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {t(`roles:permissionsList.${permission.nameKey}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {errors.permissions && <p className="mt-3 text-xs text-red-500">{errors.permissions.message}</p>}
      </div>

      {/* Buttons */}
      <FormButtons
        onCancel={onCancel}
        submitText={mode === 'create' ? t('roles:createRole') : t('roles:updateRole')}
        cancelText={t('common:cancel')}
        loadingText={mode === 'create' ? t('common:creating') : t('common:updating')}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};
