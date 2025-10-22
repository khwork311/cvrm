import { Modal } from '@/components/ui/modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateVendorBankAccount, useUpdateVendorBankAccount, useVendorBankAccount } from '../hooks';
import { vendorBankAccountSchema, type VendorBankAccountFormData } from '../schemas';

interface VendorBankAccountModalProps {
  vendorId: number;
  bankAccountId: number | null;
  onClose: () => void;
}

export const VendorBankAccountModal = ({ vendorId, bankAccountId, onClose }: VendorBankAccountModalProps) => {
  const { t } = useTranslation(['vendors', 'common', 'validation']);
  const isEditMode = !!bankAccountId;

  const { data: bankAccountData, isLoading: isLoadingBankAccount } = useVendorBankAccount(bankAccountId);
  const { trigger: createBankAccount, isMutating: isCreating } = useCreateVendorBankAccount(vendorId);
  const { trigger: updateBankAccount, isMutating: isUpdating } = useUpdateVendorBankAccount(vendorId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VendorBankAccountFormData>({
    resolver: zodResolver(vendorBankAccountSchema),
    defaultValues: {
      bank_name_en: '',
      bank_name_ar: '',
      account_holder_name: '',
      account_number: '',
      iban_number: '',
      swift_code: '',
      branch_en: '',
      branch_ar: '',
      bank_country: '',
      currency: '',
      is_default: false,
      status: 1,
    },
  });

  useEffect(() => {
    if (bankAccountData && isEditMode) {
      reset({
        bank_name_en: bankAccountData.data.bank_name_en,
        bank_name_ar: bankAccountData.data.bank_name_ar,
        account_holder_name: bankAccountData.data.account_holder_name,
        account_number: bankAccountData.data.account_number,
        iban_number: bankAccountData.data.iban_number,
        swift_code: bankAccountData.data.swift_code || '',
        branch_en: bankAccountData.data.branch_en || '',
        branch_ar: bankAccountData.data.branch_ar || '',
        bank_country: bankAccountData.data.bank_country || '',
        currency: bankAccountData.data.currency || '',
        is_default: bankAccountData.data.is_default || false,
        status: bankAccountData.data.status,
      });
    }
  }, [bankAccountData, isEditMode, reset]);

  const onSubmit = async (data: VendorBankAccountFormData) => {
    try {
      if (isEditMode && bankAccountId) {
        await updateBankAccount({ id: bankAccountId, data });
      } else {
        await createBankAccount(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save bank account:', error);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditMode ? t('vendors:editBankAccount') : t('vendors:addBankAccount')}
        </h2>

        {isLoadingBankAccount ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:bankNameEn')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('bank_name_en')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.bank_name_en && <p className="mt-1 text-sm text-red-500">{t(errors.bank_name_en.message || '')}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:bankNameAr')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('bank_name_ar')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.bank_name_ar && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.bank_name_ar.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:accountHolderName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('account_holder_name')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.account_holder_name && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.account_holder_name.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:accountNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('account_number')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 font-mono text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.account_number && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.account_number.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:ibanNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('iban_number')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 font-mono text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.iban_number && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.iban_number.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:swiftCode')}
                </label>
                <input
                  type="text"
                  {...register('swift_code')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:bankCountry')}
                </label>
                <input
                  type="text"
                  {...register('bank_country')}
                  maxLength={2}
                  placeholder="e.g., SA, AE, US"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-white/90"
                />
                {errors.bank_country && <p className="mt-1 text-sm text-red-500">{t(errors.bank_country.message || '')}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('common:cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? t('common:saving') : t('common:save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
