import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { PencilIcon } from '@/icons';
import { useTranslation } from 'react-i18next';
import { useToggleVendorAddressStatus, useVendorAddresses } from '../hooks';

interface VendorAddressesTabProps {
  vendorId: number;
}

export const VendorAddressesTab = ({ vendorId }: VendorAddressesTabProps) => {
  const { t } = useTranslation(['vendors', 'common']);

  const { data, isLoading, mutate } = useVendorAddresses(vendorId);
  const { trigger: toggleStatus } = useToggleVendorAddressStatus(vendorId);

  // Extract addresses from API response
  const addresses = data?.data?.data || [];

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
      mutate();
    } catch (error) {
      console.error('Failed to toggle address status:', error);
    }
  };

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    alert(`Edit address ${id} - Feature coming soon!`);
  };

  const handleCreate = () => {
    // TODO: Implement create functionality
    alert('Add new address - Feature coming soon!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:addresses')}</h2>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          + {t('vendors:addAddress')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">{t('vendors:noAddressesFound')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:addressType')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:street')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:city')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:country')}
                </TableCell>
                <TableCell isHeader className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:isDefault')}
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
              {addresses.map((address) => (
                <TableRow key={address.id}>
                  <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-800 dark:text-white/90">
                    <Badge variant="light" color="primary">
                      {t(`vendors:addressType_${address.address_type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {address.street_name}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {address.city?.name_en || '-'}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                    {address.country?.name_en || '-'}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-center">
                    {address.is_default ? (
                      <Badge variant="light" color="success">
                        {t('common:yes')}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">{t('common:no')}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-theme-sm px-5 py-4 text-center">
                    <Badge variant="light" color={address.status === 1 ? 'success' : 'error'}>
                      {address.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center">
                    <TableActionsDropdown
                      actions={
                        [
                          {
                            label: t('common:edit'),
                            onClick: () => handleEdit(address.id),
                            icon: <PencilIcon className="h-4 w-4" />,
                            variant: 'primary',
                          },
                          {
                            label: address.status === 1 ? t('common:deactivate') : t('common:activate'),
                            onClick: () => handleToggleStatus(address.id),
                            variant: address.status === 1 ? 'danger' : 'success',
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

      {/* TODO: Implement VendorAddressModal */}
      {/* {isModalOpen && (
        <VendorAddressModal
          vendorId={vendorId}
          addressId={editingAddressId}
          onClose={handleCloseModal}
        />
      )} */}
    </div>
  );
};
