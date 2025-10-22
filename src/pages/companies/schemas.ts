import i18n from '@/i18n/config';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key, { ns: 'validation' });

// Company Form Schema - Function to create schema with current translations
// isEdit: if true, contact person fields are optional (for update mode)
export const getCompanySchema = (isEdit = false) =>
  z
    .object({
      name_en: z.string().min(2, t('company.nameLength')).max(120, t('company.nameLength')),
      name_ar: z.string().min(2, t('company.nameLength')).max(120, t('company.nameLength')),
      vat_number: z.string().min(1, t('company.vatRequired')),
      telephone_number: z.string().optional(),
      mobile_number: z.string().optional(),
      email: z.string().email(t('company.emailInvalid')).optional().or(z.literal('')),
      website_url: z
        .url(t('company.urlInvalid'))
        .regex(/^https?:\/\/.+/, t('company.urlProtocol'))
        .optional()
        .or(z.literal('')),
      main_account_number: z.string().optional(),
      sub_account_number: z.string().optional(),
      subscription_start_date: z.string().optional(),
      subscription_end_date: z.string().optional(),
      plan_id: z.string().min(1, t('company.planRequired')),
      // Contact Person fields - required for create, optional for edit
      contact_first_name_en: isEdit
        ? z.string().optional()
        : z.string().min(1, t('contact.firstNameEnRequired')),
      contact_first_name_ar: isEdit
        ? z.string().optional()
        : z.string().min(1, t('contact.firstNameArRequired')),
      contact_last_name_en: isEdit
        ? z.string().optional()
        : z.string().min(1, t('contact.lastNameEnRequired')),
      contact_last_name_ar: isEdit
        ? z.string().optional()
        : z.string().min(1, t('contact.lastNameArRequired')),
      contact_email: isEdit ? z.string().optional() : z.string().email(t('contact.emailInvalid')),
      contact_position: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.subscription_start_date && data.subscription_end_date) {
          return new Date(data.subscription_end_date) >= new Date(data.subscription_start_date);
        }
        return true;
      },
      {
        message: t('company.dateInvalid'),
        path: ['subscription_end_date'],
      }
    );

export type CompanyFormData = z.infer<ReturnType<typeof getCompanySchema>>;

// Contact Person Schema - Function to create schema with current translations
export const getContactPersonSchema = () =>
  z.object({
    first_name_en: z.string().min(1, t('contact.firstNameEnRequired')),
    first_name_ar: z.string().min(1, t('contact.firstNameArRequired')),
    last_name_en: z.string().min(1, t('contact.lastNameEnRequired')),
    last_name_ar: z.string().min(1, t('contact.lastNameArRequired')),
    email: z.string().email(t('contact.emailInvalid')),
    position: z.string().optional(),
  });

export type ContactPersonFormData = z.infer<ReturnType<typeof getContactPersonSchema>>;

// Bank Account Schema - Function to create schema with current translations
export const getBankAccountSchema = () =>
  z.object({
    bank_name_en: z.string().min(1, t('bankAccount.bankNameEnRequired')),
    bank_name_ar: z.string().min(1, t('bankAccount.bankNameArRequired')),
    iban_number: z
      .string()
      .min(1, t('bankAccount.ibanRequired'))
      .regex(/^\d{14}$/, t('bankAccount.ibanInvalid')),
    swift_code: z.string().optional(),
    branch_en: z.string().optional(),
    branch_ar: z.string().optional(),
    bank_country: z.string().max(2, t('bankAccount.countryCodeMax')).optional(),
  });

export type BankAccountFormData = z.infer<ReturnType<typeof getBankAccountSchema>>;

// Address Schema - Function to create schema with current translations
export const getAddressSchema = () =>
  z.object({
    country_id: z.string().min(1, t('address.countryRequired')),
    city_id: z.string().min(1, t('address.cityRequired')),
    address_name: z.string().min(1, t('address.addressNameRequired')),
    street_name: z.string().min(1, t('address.streetNameRequired')),
    building_number: z.string().optional(),
    postal_code: z.string().optional(),
  });

export type AddressFormData = z.infer<ReturnType<typeof getAddressSchema>>;
