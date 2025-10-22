import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Login form schema
export const loginSchema = z.object({
  email: z.string().email(t('company.emailInvalid')),
  password: z.string().min(1, t('required')),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
