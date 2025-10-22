import PageMeta from '@/components/common/PageMeta';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUpdateUser, useUser } from './hooks/useUsers';
import type { UserFormData } from './schemas';
import { UserForm } from './UserForm';

const UpdateUser: React.FC = () => {
  const { t } = useTranslation('users');

  const { error, success } = useToast();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const userId = id ? parseInt(id) : 0;

  const { data: existingUser, isLoading } = useUser(userId);
  const { trigger: updateUser, isMutating } = useUpdateUser();

  const onSubmit = async (data: UserFormData) => {
    if (!userId) return;

    try {
      await updateUser({
        id: userId,
        data: {
          name: data.name,
          email: data.email,
          role_id: data.role_id,
          status: existingUser?.data.status!,
        },
      });

      success(t('users:userUpdated'));
      navigate('/users');
    } catch (err: any) {
      console.error(err);
      error(t('users:userUpdateFailed') + ': ' + err.response.data.message);
    }
  };

  return (
    <>
      <PageMeta title="Update User | TailAdmin Dashboard" description="Update an existing user" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">{t('updateUser')}</h2>

        <UserForm
          mode="update"
          initialData={
            existingUser
              ? {
                  name: existingUser?.data.name,
                  email: existingUser?.data.email,
                  role_id: existingUser?.data.role_id!,
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={() => navigate('/users')}
          isSubmitting={isMutating}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default UpdateUser;
