import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useActionState, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import { Input } from '../form';
import Label from '../form/Label';
import Checkbox from '../form/input/Checkbox';
import Button from '../ui/button/Button';
import { loginSchema } from './schemas';

export default function SignInForm() {
  const { t } = useTranslation(['auth', 'validation']);
  const { login } = useAuth();
  const { success, error: showError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formAction = async (_prevState: any, formData: FormData) => {
    try {
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        rememberMe: formData.get('rememberMe') === 'on',
      };

      // Validate with schema
      const validatedData = loginSchema.parse(data);

      // Integration with auth API
      await login({
        email: validatedData.email,
        password: validatedData.password,
      });

      // Show success message
      success(t('auth:loginSuccess'));
      return { success: true, errors: null };
    } catch (err: any) {
      console.error('Login error:', err);

      // Extract error message from API response
      const errorMessage = err.response?.data?.message || err.message || t('auth:loginError');
      showError(errorMessage);
      return { success: false, errors: err.errors || err.message };
    }
  };

  const [_state, formActionDispatch, isPending] = useActionState(formAction, { success: false, errors: null });

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          {t('auth:backToDashboard')}
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              {t('auth:signIn')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth:signInDescription')}</p>
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
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password">
                    {t('auth:password')} <span className="text-error-500">*</span>
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={rememberMe} onChange={setRememberMe} id="rememberMe" name="rememberMe" />
                    <label
                      htmlFor="rememberMe"
                      className="text-theme-sm block cursor-pointer font-normal text-gray-700 dark:text-gray-400"
                    >
                      {t('auth:rememberMe')}
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm"
                  >
                    {t('auth:forgotPassword')}
                  </Link>
                </div>

                {/* Submit Button */}
                <div>
                  <Button className="w-full" size="sm" disabled={isPending}>
                    {isPending ? t('auth:signingIn') : t('auth:signIn')}
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
