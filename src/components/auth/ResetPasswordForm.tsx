import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import { Input } from '../form';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { ResetPasswordFormData, resetPasswordSchema } from './schemas';

export default function ResetPasswordForm() {
  const { t, i18n } = useTranslation(['auth', 'validation']);
  const { resetPassword } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const company_id = searchParams.get('company_id') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsSubmitting(true);
      await resetPassword({
        email: data.email,
        token,
        company_id,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      success(t('auth:resetPasswordSuccess'));

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('auth:resetPasswordError');
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md pt-10">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className={`size-5 ${i18n.language === 'ar' ? 'rotate-180' : ''} `} />
          {t('auth:backToSignIn')}
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              {t('auth:resetPassword')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth:resetPasswordDescription')}</p>
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

                {/* Password Field */}
                <div>
                  <Label htmlFor="password">
                    {t('auth:newPassword')} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth:passwordPlaceholder')}
                      error={errors.password?.message}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <Label htmlFor="password_confirmation">
                    {t('auth:confirmPassword')} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password_confirmation')}
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth:confirmPasswordPlaceholder')}
                      error={errors.password_confirmation?.message}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute end-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? t('auth:resetting') : t('auth:resetPassword')}
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
