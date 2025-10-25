import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { TrashBinIcon } from '@/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useCustomerGroup, useDetachCustomers } from './hooks';

export const GroupCustomers = () => {
  const { t } = useTranslation(['customerGroups', 'common']);
  const { groupId } = useParams<{ groupId: string }>();
  const toast = useToast();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    customerId: number | null;
    customerName: string | null;
  }>({ isOpen: false, customerId: null, customerName: null });

  const { data: groupData, isLoading, mutate } = useCustomerGroup(groupId ? parseInt(groupId) : null);
  const { trigger: detachTrigger, isMutating: isDetaching } = useDetachCustomers();

  const group = groupData?.data;
  const customers = group?.customers || [];

  const handleDetachClick = (customerId: number, customerName: string) => {
    setConfirmModal({
      isOpen: true,
      customerId,
      customerName,
    });
  };

  const handleConfirmDetach = async () => {
    if (!confirmModal.customerId || !groupId) return;

    try {
      await detachTrigger({
        groupId: parseInt(groupId),
        customerIds: [confirmModal.customerId],
      });
      toast.success(t('customerGroups:detachSuccess', 'Customer removed from group successfully'));
      mutate(); // Refresh the data
    } catch (error) {
      toast.error(t('customerGroups:detachError', 'Failed to remove customer from group'));
      console.error('Error detaching customer:', error);
    } finally {
      setConfirmModal({ isOpen: false, customerId: null, customerName: null });
    }
  };

  const handleCloseModal = () => {
    if (!isDetaching) {
      setConfirmModal({ isOpen: false, customerId: null, customerName: null });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t('customerGroups:groupNotFound', 'Customer group not found')}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={t('customerGroups:groupCustomers', 'Group Customers')}
        description={t('customerGroups:groupCustomersDescription', 'View customers in this group')}
      />

      <div className="p-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2">
          <Link to="/customer-groups" className="text-blue-500 hover:underline">
            {t('customerGroups:title', 'Customer Groups')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 dark:text-gray-300">
            {group.name_en} - {t('customerGroups:customers', 'Customers')}
          </span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{group.name_en}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400" dir="rtl">
              {group.name_ar}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="light" color="info">
                {customers.length} {t('customerGroups:customersCount', 'Customers')}
              </Badge>
            </div>
          </div>

          <Link
            to={`/customer-groups/${groupId}/assign`}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + {t('customerGroups:addCustomers', 'Add Customers')}
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 dark:border-gray-700">
          <Table className="min-w-[600px]">
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('customerGroups:customerNameEn', 'Name (EN)')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('customerGroups:customerNameAr', 'Name (AR)')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('common:actions')}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {customers.length > 0 ? (
                customers.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-theme-sm px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                      {customer.name_en}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                      <div dir="auto">{customer.name_ar}</div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDetachClick(customer.id, customer.name_en)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        title={t('common:remove')}
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <img src="/images/error/404.svg" alt="No customers" className="dark:hidden" />
                      <img src="/images/error/404-dark.svg" alt="No customers" className="hidden dark:block" />
                      <p className="text-center text-xl font-semibold text-gray-500 dark:text-gray-400">
                        {t('customerGroups:noCustomersInGroup', 'No customers in this group yet')}
                      </p>
                      <Link to={`/customer-groups/${groupId}/assign`} className="text-blue-500 hover:underline">
                        {t('customerGroups:addFirstCustomer', 'Add your first customer')}
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDetach}
        title={t('customerGroups:removeCustomerTitle', 'Remove Customer')}
        message={t(
          'customerGroups:removeCustomerMessage',
          `Are you sure you want to remove "${confirmModal.customerName}" from this group?`
        )}
        confirmText={t('common:remove', 'Remove')}
        cancelText={t('common:cancel')}
        variant="danger"
        isLoading={isDetaching}
      />
    </>
  );
};
