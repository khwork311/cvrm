import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../../icons';
import { Input } from '../form';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { ForgotPasswordFormData, forgotPasswordSchema } from './schemas';

export default function ForgotPasswordForm() {
  const { t } = useTranslation(['auth', 'validation']);
  const { forgotPassword } = useAuth();
  const { success, error: showError } = useToast();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      await forgotPassword(data.email);
      setIsSuccess(true);
      success(t('auth:forgotPasswordSuccess'));
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('auth:forgotPasswordError');
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md pt-10">
          <Link
            to="/signin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            {t('auth:backToSignIn')}
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">{t('auth:checkYourEmail')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth:passwordResetLinkSent')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md pt-10">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          {t('auth:backToSignIn')}
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              {t('auth:forgotPassword')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth:forgotPasswordDescription')}</p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email">
                    {t('auth:email')} <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder={t('auth:emailPlaceholder')}
                    error={errors.email?.message}
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? t('auth:sending') : t('auth:sendResetLink')}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
