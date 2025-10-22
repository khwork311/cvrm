import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// User Form Schema
export const getUserSchema = (mode: 'create' | 'update' = 'create') =>
  z.object({
    name: z.string().min(2, t('user.nameMinLength')).max(100, t('user.nameMaxLength')),
    email: z.string().email(t('user.emailInvalid')),
    password:
      mode === 'create'
        ? z.string().min(8, t('user.passwordMinLength'))
        : z.string().min(8, t('user.passwordMinLength')).optional().or(z.literal('')),
    role_id: z.number().min(1, t('user.roleRequired')),
  });

export type UserFormData = z.infer<ReturnType<typeof getUserSchema>>;
