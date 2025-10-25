import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { DollarLineIcon, PencilIcon, ShootingStarIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetDefaultVendorBankAccount, useToggleVendorBankAccountStatus, useVendorBankAccounts } from '../hooks';
import { VendorBankAccountModal } from './VendorBankAccountModal';

interface VendorBankAccountsTabProps {
  vendorId: number;
}

export const VendorBankAccountsTab = ({ vendorId }: VendorBankAccountsTabProps) => {
  const { t } = useTranslation(['vendors', 'common']);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBankAccountId, setEditingBankAccountId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useVendorBankAccounts(vendorId, {
    page,
    limit: PAGE_LIMIT,
    search,
    status: statusFilter,
  });
  const { trigger: toggleStatus } = useToggleVendorBankAccountStatus(vendorId);
  const { trigger: setDefaultBankAccount } = useSetDefaultVendorBankAccount(vendorId);

  // Extract bank accounts from API response
  const bankAccounts = data?.data?.data || [];
  const pagination = data?.data;

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
      mutate();
    } catch (error) {
      console.error('Failed to toggle bank account status:', error);
    }
  };

  const handleSetDefault = async (bankAccountId: number) => {
    try {
      await setDefaultBankAccount(bankAccountId);
      mutate();
    } catch (error) {
      console.error('Failed to set default bank account:', error);
    }
  };

  const handleEdit = (id: number) => {
    setEditingBankAccountId(id);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBankAccountId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBankAccountId(null);
    mutate();
  };

  const maskAccountNumber = (account: string) => {
    if (account.length <= 4) return account;
    return '****' + account.slice(-4);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:bankAccounts')}</h2>
        <Button onClick={handleCreate} variant="primary" size="sm">
          + {t('vendors:addBankAccount')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder={t('common:search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:text-white/90"
        />
        <select
          value={statusFilter ?? ''}
          onChange={(e) => {
            setStatusFilter(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:text-white/90"
        >
          <option value="">{t('common:allStatuses')}</option>
          <option value="1">{t('common:active')}</option>
          <option value="0">{t('common:inactive')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <DollarLineIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/90">
              {t('vendors:noBankAccountsFound')}
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              {t('vendors:noBankAccountsDescription', 'Add bank accounts to manage vendor payments')}
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + {t('vendors:addBankAccount')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:bankName')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:branch')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:ibanNumber')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:swiftCode')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('common:status')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('common:actions')}
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="text-theme-sm px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                    {account.bank_name_en}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {account.branch_en || '-'}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-start font-mono text-gray-600 dark:text-gray-400">
                    {maskAccountNumber(account.iban_number)}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {account.swift_code || '-'}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-center">
                    <Badge variant="light" color={account.status === 1 ? 'success' : 'error'}>
                      {account.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center">
                    <TableActionsDropdown
                      actions={
                        [
                          {
                            label: t('common:edit'),
                            onClick: () => handleEdit(account.id),
                            icon: <PencilIcon className="h-4 w-4" />,
                            variant: 'primary',
                          },
                          !account.is_default && {
                            label: t('vendors:setAsDefault'),
                            onClick: () => handleSetDefault(account.id),
                            icon: <ShootingStarIcon className="h-4 w-4" />,
                            variant: 'warning',
                          },
                          {
                            label: account.status === 1 ? t('common:deactivate') : t('common:activate'),
                            onClick: () => handleToggleStatus(account.id),
                            variant: account.status === 1 ? 'danger' : 'success',
                          },
                        ].filter(Boolean) as TableAction[]
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('common:showing')} {pagination.from} {t('common:to')} {pagination.to} {t('common:of')} {pagination.total}{' '}
            {t('common:results')}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              {t('common:previous')}
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              {page} / {pagination.last_page}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={page === pagination.last_page}
              variant="outline"
              size="sm"
            >
              {t('common:next')}
            </Button>
          </div>
        </div>
      )}

      {/* Bank Account Modal */}
      {isModalOpen && (
        <VendorBankAccountModal vendorId={vendorId} bankAccountId={editingBankAccountId} onClose={handleCloseModal} />
      )}
    </div>
  );
};
