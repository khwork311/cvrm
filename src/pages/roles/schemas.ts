import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Role Form Schema
export const getRoleSchema = () =>
  z.object({
    name: z.string().min(2, t('role.nameMinLength')).max(50, t('role.nameMaxLength')),
    permissions: z.array(z.string()).min(1, t('role.atLeastOnePermission')),
  });

export type RoleFormData = z.infer<ReturnType<typeof getRoleSchema>>;
