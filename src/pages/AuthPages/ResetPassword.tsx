import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import PageMeta from '@/components/common/PageMeta';
import AuthLayout from './AuthPageLayout';

export default function ResetPassword() {
  return (
    <>
      <PageMeta title="Reset Password | CVRM Dashboard" description="Create a new password" />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
