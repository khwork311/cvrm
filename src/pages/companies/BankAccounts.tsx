import { EmptyState } from '@/components/common/EmptyState';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon } from '@/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import type { BankAccount } from './api/companies.api';
import {
  useBankAccounts,
  useCountries,
  useCreateBankAccount,
  useToggleBankAccountStatus,
  useUpdateBankAccount,
} from './hooks/useBankAccounts';
import { getBankAccountSchema, type BankAccountFormData } from './schemas.ts';

interface Option {
  value: string;
  label: string;
}

type StatusFilter = 'all' | '1' | '0';

export const BankAccounts = () => {
  const { t } = useTranslation(['bankAccounts', 'common']);
  const { companyId } = useParams<{ companyId: string }>();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    accountId: number | null;
    action: '1' | '0' | null;
  }>({ isOpen: false, accountId: null, action: null });
  const debouncedSearch = useDebounce(search, 500);

  // Fetch bank accounts using SWR
  const { data, isLoading, mutate } = useBankAccounts(companyId ? Number(companyId) : null, {
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { trigger: toggleTrigger } = useToggleBankAccountStatus();

  const bankAccounts = data?.data?.data || [];

  const statusOptions: Option[] = [
    { value: 'all', label: t('common:all') },
    { value: '1', label: t('common:active') },
    { value: '0', label: t('common:notActive') },
  ];

  const handleConfirmStatusChange = async () => {
    if (!confirmModal.accountId) return;

    try {
      await toggleTrigger(confirmModal.accountId);
      mutate();
      toast.success(
        confirmModal.action === '1'
          ? t('bankAccounts:activateSuccess', 'Bank account activated successfully')
          : t('bankAccounts:deactivateSuccess', 'Bank account deactivated successfully')
      );
    } catch (error) {
      console.error('Error toggling bank account status:', error);
      toast.error(
        confirmModal.action === '1'
          ? t('bankAccounts:activateError', 'Failed to activate bank account')
          : t('bankAccounts:deactivateError', 'Failed to deactivate bank account')
      );
    } finally {
      setConfirmModal({ isOpen: false, accountId: null, action: null });
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  const maskIBAN = (iban: string) => {
    if (iban.length <= 4) return iban;
    return '****' + iban.slice(-4);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2">
        <Link to="/companies" className="text-blue-500 hover:underline">
          Companies
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">Bank Accounts</span>
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
          {t('bankAccounts:title', 'Bank Accounts')}
        </h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder={t('bankAccounts:searchPlaceholder', 'Search by bank name or account number...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-brand-500/10 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            {isSearching && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
              </div>
            )}
          </div>

          <Select
            options={statusOptions}
            defaultValue="all"
            placeholder={t('bankAccounts:filterStatus', 'Filter by status')}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            className="dark:bg-dark-900"
          />

          <button
            onClick={handleCreate}
            className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + {t('bankAccounts:createNew', 'Add Bank Account')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 dark:border-gray-700">
        <Table className="min-w-[1100px]">
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('bankAccounts:bankNameColumn', 'Bank Name')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('bankAccounts:ibanColumn', 'IBAN')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('bankAccounts:swiftColumn', 'SWIFT Code')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('bankAccounts:branchColumn', 'Branch')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
              >
                {t('bankAccounts:countryColumn', 'Country')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
              >
                {t('common:status', 'Status')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
              >
                {t('common:actions', 'Actions')}
              </TableCell>
            </TableRow>
          </TableHeader>

          {isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex h-96 items-center justify-center">
                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          )}

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {bankAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="px-5 py-4 text-start">
                  <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {account.bank_name_en}
                  </div>
                  <div className="text-theme-xs text-gray-500 dark:text-gray-400">{account.bank_name_ar}</div>
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 font-mono text-gray-600 dark:text-gray-400">
                  {maskIBAN(account.iban_number)}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                  {account.swift_code || '-'}
                </TableCell>

                <TableCell className="px-5 py-4 text-start">
                  <div className="text-theme-sm text-gray-600 dark:text-gray-400">{account.branch_en || '-'}</div>
                  {account.branch_ar && (
                    <div className="text-theme-xs text-gray-500 dark:text-gray-400">{account.branch_ar}</div>
                  )}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                  {account.bank_country || '-'}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-center">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        accountId: account.id,
                        action: account.status === 1 ? '0' : '1',
                      })
                    }
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    title={account.status === 1 ? t('common:deactivate') : t('common:activate')}
                  >
                    <Badge variant="light" color={account.status === 1 ? 'success' : 'error'}>
                      {account.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </button>
                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleEdit(account)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    title={t('common:edit')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {bankAccounts.length === 0 && (
        <EmptyState
          title={t('bankAccounts:noAccountsFound', 'No bank accounts found')}
          description={t('bankAccounts:addFirstAccount', 'Add your first bank account')}
        />
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <BankAccountModal
          account={editingAccount}
          companyId={Number(companyId)}
          onClose={() => setShowModal(false)}
          onSave={() => {
            mutate();
            setShowModal(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, accountId: null, action: null })}
        onConfirm={handleConfirmStatusChange}
        title={
          confirmModal.action === '1'
            ? t('bankAccounts:activateConfirmTitle', 'Activate Bank Account')
            : t('bankAccounts:deactivateConfirmTitle', 'Deactivate Bank Account')
        }
        message={
          confirmModal.action === '1'
            ? t('bankAccounts:activateConfirmMessage', 'Are you sure you want to activate this bank account?')
            : t('bankAccounts:deactivateConfirmMessage', 'Are you sure you want to deactivate this bank account?')
        }
        confirmText={confirmModal.action === '1' ? t('common:activate') : t('common:deactivate')}
        cancelText={t('common:cancel')}
        variant={confirmModal.action === '1' ? 'success' : 'danger'}
      />
    </div>
  );
};

// Bank Account Modal Component
interface BankAccountModalProps {
  account: BankAccount | null;
  companyId: number;
  onClose: () => void;
  onSave: () => void;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({ account, companyId, onClose, onSave }) => {
  const { t, i18n } = useTranslation(['bankAccounts', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: countries } = useCountries();
  const { trigger: createTrigger } = useCreateBankAccount(companyId);
  const { trigger: updateTrigger } = useUpdateBankAccount();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(getBankAccountSchema()),
    defaultValues: {
      bank_name_en: account?.bank_name_en || '',
      bank_name_ar: account?.bank_name_ar || '',
      iban_number: account?.iban_number || '',
      swift_code: account?.swift_code || '',
      branch_en: account?.branch_en || '',
      branch_ar: account?.branch_ar || '',
      bank_country: account?.bank_country || '',
    },
  });

  const onSubmit = async (data: BankAccountFormData) => {
    try {
      setIsSubmitting(true);

      if (account) {
        await updateTrigger({ id: account.id, data });
      } else {
        await createTrigger(data);
      }

      onSave();
    } catch (error) {
      // console.error('Error saving bank account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {account
            ? t('bankAccounts:editAccount', 'Edit Bank Account')
            : t('bankAccounts:addAccount', 'Add Bank Account')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Bank Name EN */}
            <div>
              <label
                htmlFor="bank_name_en"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Bank Name (EN) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('bank_name_en')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.bank_name_en && <p className="mt-1 text-xs text-red-500">{errors.bank_name_en.message}</p>}
            </div>

            {/* Bank Name AR */}
            <div>
              <label
                htmlFor="bank_name_ar"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Bank Name (AR) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('bank_name_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.bank_name_ar && <p className="mt-1 text-xs text-red-500">{errors.bank_name_ar.message}</p>}
            </div>

            {/* IBAN */}
            <div>
              <label
                htmlFor="iban_number"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                IBAN Number (14 digits) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('iban_number')}
                type="text"
                maxLength={14}
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="12345678901234"
              />
              {errors.iban_number && <p className="mt-1 text-xs text-red-500">{errors.iban_number.message}</p>}
            </div>

            {/* SWIFT Code */}
            <div>
              <label htmlFor="swift_code" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                SWIFT Code
              </label>
              <input
                {...register('swift_code')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="RJHISARI"
              />
            </div>

            {/* Branch EN */}
            <div>
              <label htmlFor="branch_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Branch (EN)
              </label>
              <input
                {...register('branch_en')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* Branch AR */}
            <div>
              <label htmlFor="branch_ar" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Branch (AR)
              </label>
              <input
                {...register('branch_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label
                htmlFor="bank_country"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Country Code (ISO)
              </label>
              {/* <input
                {...register('bank_country')}
                type="text"
                maxLength={2}
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="SA"
              /> */}
              <Controller
                name="bank_country"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={
                      countries?.data?.data?.map((country) => ({
                        value: country?.code!,
                        label: i18n.language === 'ar' ? country?.name_ar! : country?.name_en!,
                      })) || []
                    }
                    placeholder={t('bankAccounts:countryPlaceholder')}
                    className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t('common:saving', 'Saving...')
                : account
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccounts;
