import { z } from 'zod';

/**
 * Vendor Form Schema
 */
export const vendorSchema = z.object({
  name_en: z.string().min(1, 'validation:required'),
  name_ar: z.string().optional(),
  phone_number: z.string().min(1, 'validation:required'),
  email: z.string().email('validation:invalidEmail').min(1, 'validation:required'),
  tax_number: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

/**
 * Vendor Address Form Schema
 */
export const vendorAddressSchema = z.object({
  address_type: z.enum(['billing', 'shipping', 'other']),
  is_default: z.boolean(),
  country_id: z.number().min(1, 'validation:required'),
  city_id: z.number().min(1, 'validation:required'),
  address_name: z.string().min(1, 'validation:required'),
  street_name: z.string().min(1, 'validation:required'),
  building_number: z.string().optional(),
  postal_code: z.string().optional(),
  status: z.number(),
});

export type VendorAddressFormData = z.infer<typeof vendorAddressSchema>;

/**
 * Vendor Bank Account Form Schema
 */
export const vendorBankAccountSchema = z.object({
  bank_name_en: z.string().min(1, 'validation:required'),
  bank_name_ar: z.string().min(1, 'validation:required'),
  account_holder_name: z.string().min(1, 'validation:required'),
  account_number: z.string().min(1, 'validation:required'),
  iban_number: z.string().min(1, 'validation:required'),
  is_default: z.boolean(),
  status: z.number(),
  swift_code: z.string().optional(),
  branch_en: z.string().optional(),
  branch_ar: z.string().optional(),
  bank_country: z.string().max(2, 'validation:countryCodeMax').optional(),
  currency: z.string().optional(),
});

export type VendorBankAccountFormData = z.infer<typeof vendorBankAccountSchema>;

/**
 * Send Invitation Schema
 */
export const sendInvitationSchema = z.object({
  email: z.string().email('validation:invalidEmail').min(1, 'validation:required'),
  name_en: z.string().min(1, 'validation:required'),
  name_ar: z.string().optional(),
  phone_number: z.string().min(1, 'validation:required'),
  tax_number: z.string().optional(),
});

export type SendInvitationFormData = z.infer<typeof sendInvitationSchema>;

/**
 * Accept Invitation Schema
 */
export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1, 'validation:required'),
    name_en: z.string().min(1, 'validation:required'),
    name_ar: z.string().min(1, 'validation:required'),
    email: z.string().email('validation:invalidEmail').min(1, 'validation:required'),
    phone_number: z.string().min(1, 'validation:required'),
    tax_number: z.string().min(1, 'validation:required'),
    password: z.string().min(8, 'validation:passwordMinLength'),
    password_confirmation: z.string().min(1, 'validation:required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'validation:passwordMismatch',
    path: ['password_confirmation'],
  });

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;
