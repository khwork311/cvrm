import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';

export default function ForgotPassword() {
  return (
    <>
      <PageMeta title="Forgot Password | CVRM Dashboard" description="Reset your password" />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
