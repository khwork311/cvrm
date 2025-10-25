import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import { Input } from '../form';
import Label from '../form/Label';
import Button from '../ui/button/Button';
import { LoginFormData, loginSchema } from './schemas';

export default function SignInForm() {
  const { t } = useTranslation(['auth', 'validation']);
  const { login } = useAuth();
  const { success, error: showError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleLogin = async (formData: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Integration with auth API
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Show success message
      success(t('auth:loginSuccess'));
    } catch (err: any) {
      console.error('Login error:', err);
      // Extract error message from API response for toast
      const errorMessage = err.response?.data?.message || err.message || t('auth:loginError');
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              {t('auth:signIn')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth:signInDescription')}</p>
          </div>
          <div>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email">
                    {t('auth:email')} <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    name="email"
                    id="email"
                    placeholder={t('auth:emailPlaceholder')}
                    error={errors?.email}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password">
                    {t('auth:password')} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      name="password"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth:passwordPlaceholder')}
                      error={errors?.password}
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

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm"
                  >
                    {t('auth:forgotPassword')}
                  </Link>
                </div>

                {/* Submit Button */}
                <div>
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? t('auth:signingIn') : t('auth:signIn')}
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
