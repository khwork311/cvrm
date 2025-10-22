import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Vendor Group Form Schema - Function to create schema with current translations
export const getVendorGroupSchema = () =>
  z.object({
    name_en: z
      .string()
      .min(2, t('vendorGroup.nameLength') || 'Name must be between 2 and 120 characters')
      .max(120, t('vendorGroup.nameLength') || 'Name must be between 2 and 120 characters'),
    name_ar: z
      .string()
      .min(2, t('vendorGroup.nameLength') || 'Name must be between 2 and 120 characters')
      .max(120, t('vendorGroup.nameLength') || 'Name must be between 2 and 120 characters'),
    status: z.number(),
  });

export type VendorGroupFormData = z.infer<ReturnType<typeof getVendorGroupSchema>>;

// Vendor Assignment Schema - Function to create schema with current translations
export const getVendorAssignmentSchema = () =>
  z.object({
    vendor_group_id: z.string().min(1, t('vendorGroup.groupRequired') || 'Please select a vendor group'),
    vendor_id: z.string().min(1, t('vendorGroup.vendorRequired') || 'Please select a vendor'),
  });

export type VendorAssignmentFormData = z.infer<ReturnType<typeof getVendorAssignmentSchema>>;
