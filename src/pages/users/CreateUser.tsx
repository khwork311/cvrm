import PageMeta from '@/components/common/PageMeta';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from './hooks/useUsers';
import type { UserFormData } from './schemas';
import { UserForm } from './UserForm';

const CreateUser: React.FC = () => {
  const { t } = useTranslation('users');

  const { error, success } = useToast();

  const navigate = useNavigate();
  const { trigger: createUser, isMutating } = useCreateUser();

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password || '',
        role_id: data.role_id,
      });

      success(t('users:userCreated'));
      navigate('/users');
    } catch (err: any) {
      console.error(err);
      error(t('users:userCreateFailed') + ': ' + err.response.data.message);
    }
  };

  return (
    <>
      <PageMeta title="Create User | TailAdmin Dashboard" description="Create a new user for your system" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">{t('createUser')}</h2>

        <UserForm mode="create" onSubmit={onSubmit} onCancel={() => navigate('/users')} isSubmitting={isMutating} />
      </div>
    </>
  );
};

export default CreateUser;
