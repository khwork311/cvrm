import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Plan Form Schema
export const getPlanSchema = () =>
  z.object({
    title_en: z.string().min(2, t('plan.titleEnRequired')).max(120, t('plan.titleEnLength')),
    title_ar: z.string().min(2, t('plan.titleArRequired')).max(120, t('plan.titleArLength')),
    description_en: z.string(),
    description_ar: z.string(),
    users_limit: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: t('plan.numberInvalid'),
      })
      .min(1, t('contact.firstNameEnRequired')),
    customers_limit: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: t('plan.numberInvalid'),
      })
      .min(1, t('contact.firstNameEnRequired')),
    vendors_limit: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: t('plan.numberInvalid'),
      })
      .min(1, t('contact.firstNameEnRequired')),
  });

export type PlanFormData = z.infer<ReturnType<typeof getPlanSchema>>;
