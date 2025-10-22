import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Customer Group Form Schema - Function to create schema with current translations
export const getCustomerGroupSchema = () =>
  z.object({
    company_id: z.number(),
    name_en: z
      .string()
      .min(2, t('customerGroup.nameLength') || 'Name must be between 2 and 120 characters')
      .max(120, t('customerGroup.nameLength') || 'Name must be between 2 and 120 characters'),
    name_ar: z
      .string()
      .min(2, t('customerGroup.nameLength') || 'Name must be between 2 and 120 characters')
      .max(120, t('customerGroup.nameLength') || 'Name must be between 2 and 120 characters'),
  });

export type CustomerGroupFormData = z.infer<ReturnType<typeof getCustomerGroupSchema>>;

// Customer Assignment Schema - Function to create schema with current translations
export const getCustomerAssignmentSchema = () =>
  z.object({
    customer_group_id: z.string().min(1, t('customerGroup.groupRequired') || 'Please select a customer group'),
    customer_id: z.string().min(1, t('customerGroup.customerRequired') || 'Please select a customer'),
  });

export type CustomerAssignmentFormData = z.infer<ReturnType<typeof getCustomerAssignmentSchema>>;
