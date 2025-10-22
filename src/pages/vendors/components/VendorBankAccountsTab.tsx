import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { PencilIcon } from '@/icons';
import { useTranslation } from 'react-i18next';
import { useToggleVendorBankAccountStatus, useVendorBankAccounts } from '../hooks';

interface VendorBankAccountsTabProps {
  vendorId: number;
}

export const VendorBankAccountsTab = ({ vendorId }: VendorBankAccountsTabProps) => {
  const { t } = useTranslation(['vendors', 'common']);

  const { data, isLoading, mutate } = useVendorBankAccounts(vendorId);
  const { trigger: toggleStatus } = useToggleVendorBankAccountStatus(vendorId);

  // Extract bank accounts from API response
  const bankAccounts = data?.data?.data || [];

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
      mutate();
    } catch (error) {
      console.error('Failed to toggle bank account status:', error);
    }
  };

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    alert(`Edit bank account ${id} - Feature coming soon!`);
  };

  const handleCreate = () => {
    // TODO: Implement create functionality
    alert('Add new bank account - Feature coming soon!');
  };

  const maskAccountNumber = (account: string) => {
    if (account.length <= 4) return account;
    return '****' + account.slice(-4);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:bankAccounts')}</h2>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          + {t('vendors:addBankAccount')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">{t('vendors:noBankAccountsFound')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:bankName')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:branch')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:ibanNumber')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:swiftCode')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                  {t('common:status')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
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
                          {
                            label: account.status === 1 ? t('common:deactivate') : t('common:activate'),
                            onClick: () => handleToggleStatus(account.id),
                            variant: account.status === 1 ? 'danger' : 'success',
                          },
                        ] as TableAction[]
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TODO: Implement VendorBankAccountModal */}
      {/* {isModalOpen && (
        <VendorBankAccountModal
          vendorId={vendorId}
          bankAccountId={editingBankAccountId}
          onClose={handleCloseModal}
        />
      )} */}
    </div>
  );
};
