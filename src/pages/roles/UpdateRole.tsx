import PageMeta from '@/components/common/PageMeta';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRole, useUpdateRole } from './hooks/useRoles';
import { RoleForm } from './RoleForm';
import type { RoleFormData } from './schemas';

const UpdateRole: React.FC = () => {
  const { t } = useTranslation(['roles', 'common']);

  const { error, success } = useToast();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const roleId = id ? parseInt(id) : null;

  const { data: existingRole, isLoading } = useRole(roleId);
  const { trigger: updateRole, isMutating } = useUpdateRole();

  const onSubmit = async (data: RoleFormData) => {
    if (!roleId) return;

    try {
      await updateRole({
        id: roleId,
        role_name: data.name,
        permissions: data.permissions,
      });

      success(t('roles:roleUpdated'));
      navigate('/roles');
    } catch (err: any) {
      console.error(err);
      error(t('roles:roleUpdateFailed') + ': ' + err.response.data.message);
    }
  };

  return (
    <>
      <PageMeta title="Update Role | TailAdmin Dashboard" description="Update an existing role" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">{t('roles:updateRole')}</h2>

        <RoleForm
          mode="update"
          initialData={
            existingRole
              ? {
                  name: existingRole.data.name,
                  permissions: existingRole.data.permissions ? existingRole.data.permissions.map((p) => p.name) : [],
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={() => navigate('/roles')}
          isSubmitting={isMutating}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default UpdateRole;
