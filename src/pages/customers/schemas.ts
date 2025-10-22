import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Customer Form Schema - Function to create schema with current translations
export const getCustomerSchema = () =>
  z.object({
    name_en: z
      .string()
      .min(2, t('customer.nameEnRequired') || 'Name in English is required')
      .max(120, t('customer.nameEnLength') || 'Name must be less than 120 characters'),
    name_ar: z
      .string()
      .min(2, t('customer.nameArRequired') || 'Name in Arabic is required')
      .max(120, t('customer.nameArLength') || 'Name must be less than 120 characters'),
    phone_number: z
      .string()
      .min(1, t('customer.phoneRequired') || 'Phone number is required')
      .regex(/^[0-9+\-\s()]+$/, t('customer.phoneInvalid') || 'Invalid phone number format'),
    email: z
      .string()
      .min(1, t('customer.emailRequired') || 'Email is required')
      .email(t('customer.emailInvalid') || 'Invalid email address'),
    tax_number: z.string().min(1, t('customer.taxNumberRequired') || 'Tax number is required'),
    // password: z.string().min(6, t('customer.passwordRequired') || 'Password is required'),
    // confirm_password: z.string().min(6, t('customer.confirmPasswordRequired') || 'Confirm password is required'),
    customer_group_id: z.number().min(1, t('customer.customerGroupRequired') || 'Customer group is required'),
  });

export type CustomerFormData = z.infer<ReturnType<typeof getCustomerSchema>>;
