import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useActionState, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import { Input } from '../form';
import Label from '../form/Label';
import Button from '../ui/button/Button';

const resetPasswordSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

export default function ResetPasswordForm() {
  const { t } = useTranslation(['auth', 'validation']);
  const { resetPassword } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const formAction = async (_prevState: any, formData: FormData) => {
    try {
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string,
      };

      // Validate with schema
      const validatedData = resetPasswordSchema.parse(data);

      await resetPassword({
        email: validatedData.email,
        token: token,
        password: validatedData.password,
        password_confirmation: validatedData.password_confirmation,
      });

      success(t('auth:resetPasswordSuccess'));

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      return { success: true, errors: null };
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('auth:resetPasswordError');
      showError(errorMessage);
      return { success: false, errors: err.errors || err.message };
    }
  };

  const [_state, formActionDispatch, isPending] = useActionState(formAction, { success: false, errors: null });

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
              {t('auth:resetPassword')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth:resetPasswordDescription')}</p>
          </div>
          <div>
            <form action={formActionDispatch}>
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email">
                    {t('auth:email')} <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder={t('auth:emailPlaceholder')}
                    defaultValue={emailParam}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password">
                    {t('auth:newPassword')} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth:passwordPlaceholder')}
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
                      name="password_confirmation"
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth:confirmPasswordPlaceholder')}
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
                  <Button className="w-full" size="sm" disabled={isPending}>
                    {isPending ? t('auth:resetting') : t('auth:resetPassword')}
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
