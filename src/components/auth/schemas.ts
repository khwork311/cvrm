import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Login form schema
export const loginSchema = z.object({
  email: z.string().min(1, t('required')).email(t('company.emailInvalid')),
  password: z.string().min(8, t('user.passwordMinLength')),
  rememberMe: z.boolean(),
});

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, t('required')).email(t('company.emailInvalid')),
});

// Reset password form schema
export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, t('required')).email(t('company.emailInvalid')),
    password: z.string().min(8, t('user.passwordMinLength')),
    password_confirmation: z.string().min(1, t('required')),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: t('auth:passwordsDontMatch'),
    path: ['password_confirmation'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
