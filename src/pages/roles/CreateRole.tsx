import PageMeta from '@/components/common/PageMeta';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCreateRole } from './hooks/useRoles';
import { RoleForm } from './RoleForm';
import type { RoleFormData } from './schemas';

const CreateRole: React.FC = () => {
  const { t } = useTranslation(['roles', 'common']);

  const { error, success } = useToast();

  const navigate = useNavigate();
  const { trigger: createRole, isMutating } = useCreateRole();

  const onSubmit = async (data: RoleFormData) => {
    try {
      await createRole({
        role_name: data.name,
        permissions: data.permissions,
      });
      success(t('roles:roleCreated'));
      navigate('/roles');
    } catch (err: unknown) {
      console.error(err);
      const getMessage = (error: unknown): string => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error !== null) {
          const e = error as { response?: { data?: { message?: unknown } } };
          const m = e.response?.data?.message;
          if (typeof m === 'string') return m;
          if (m !== undefined) return String(m);
        }
        return String(error);
      };
      error(t('roles:roleCreateFailed') + ': ' + getMessage(err));
    }
  };

  return (
    <>
      <PageMeta title="Create Role | TailAdmin Dashboard" description="Create a new role for your system" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">{t('roles:createRole')}</h2>

        <RoleForm mode="create" onSubmit={onSubmit} onCancel={() => navigate('/roles')} isSubmitting={isMutating} />
      </div>
    </>
  );
};

export default CreateRole;
