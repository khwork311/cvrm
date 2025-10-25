import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { GridIcon, PencilIcon, ShootingStarIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetDefaultVendorAddress, useToggleVendorAddressStatus, useVendorAddresses } from '../hooks';
import { VendorAddressModal } from './VendorAddressModal';

interface VendorAddressesTabProps {
  vendorId: number;
}

export const VendorAddressesTab = ({ vendorId }: VendorAddressesTabProps) => {
  const { t } = useTranslation(['vendors', 'common']);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<'billing' | 'shipping' | 'other' | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useVendorAddresses(vendorId, {
    page,
    limit: PAGE_LIMIT,
    search,
    status: statusFilter,
    address_type: typeFilter,
  });
  const { trigger: toggleStatus } = useToggleVendorAddressStatus(vendorId);
  const { trigger: setDefaultAddress } = useSetDefaultVendorAddress(vendorId);

  // Extract addresses from API response
  const addresses = data?.data?.data || [];
  const pagination = data?.data;

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
      mutate();
    } catch (error) {
      console.error('Failed to toggle address status:', error);
    }
  };

  const handleSetDefault = async (addressId: number, type: 'billing' | 'shipping') => {
    try {
      await setDefaultAddress({ addressId, type });
      mutate();
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleEdit = (id: number) => {
    setEditingAddressId(id);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAddressId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
    mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:addresses')}</h2>
        <Button onClick={handleCreate} variant="primary" size="sm">
          + {t('vendors:addAddress')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <select
          value={typeFilter ?? ''}
          onChange={(e) => {
            setTypeFilter(e.target.value as any);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:text-white/90"
        >
          <option value="">{t('vendors:allTypes')}</option>
          <option value="billing">{t('vendors:addressType_billing')}</option>
          <option value="shipping">{t('vendors:addressType_shipping')}</option>
          <option value="other">{t('vendors:addressType_other')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <GridIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/90">
              {t('vendors:noAddressesFound')}
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              {t('vendors:noAddressesDescription', 'Add addresses to manage vendor locations')}
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + {t('vendors:addAddress')}
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
                  {t('vendors:addressType')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:street')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:city')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:country')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('vendors:isDefault')}
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
                          !address.is_default && {
                            label: t('vendors:setAsDefault'),
                            onClick: () => handleSetDefault(address.id, address.address_type as 'billing' | 'shipping'),
                            icon: <ShootingStarIcon className="h-4 w-4" />,
                            variant: 'warning',
                          },
                          {
                            label: address.status === 1 ? t('common:deactivate') : t('common:activate'),
                            onClick: () => handleToggleStatus(address.id),
                            variant: address.status === 1 ? 'danger' : 'success',
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

      {/* Address Modal */}
      {isModalOpen && (
        <VendorAddressModal vendorId={vendorId} addressId={editingAddressId} onClose={handleCloseModal} />
      )}
    </div>
  );
};
