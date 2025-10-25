import { EmptyState } from '@/components/common/EmptyState';
import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useSidebar } from '@/context/SidebarContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon, UserIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Vendor } from './api/vendors.api';
import { PageHeader } from './components/PageHeader';
import { VendorModal } from './components/VendorModal';
import { useToggleVendorStatus, useVendors } from './hooks';

interface Option {
  value: string;
  label: string;
}

export const VendorsList = () => {
  const { t, i18n } = useTranslation(['vendors', 'common']);
  const { user } = useAuth();
  const toast = useToast();
  const { isExpanded } = useSidebar();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const company_id = user?.company_id!;

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, mutate } = useVendors({
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? Number(statusFilter) : undefined,
    has_user: userFilter === 'linked' ? 1 : userFilter === 'not_linked' ? 0 : undefined,
    page,
    per_page: PAGE_LIMIT,
    company_id,
  });

  const { trigger: toggleStatusMutation, isMutating: isToggling } = useToggleVendorStatus();

  const vendors = data?.data?.data || [];
  const paginationData = data?.data;
  const total = paginationData?.total || 0;
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from ?? 0;
  const to = paginationData?.to ?? 0;

  const statusOptions: Option[] = [
    { value: 'all', label: t('common:all') },
    { value: '1', label: t('common:active') },
    { value: '0', label: t('common:inactive') },
  ];

  const userFilterOptions: Option[] = [
    { value: 'all', label: t('vendors:allVendors') },
    { value: 'linked', label: t('vendors:linkedToUser') },
    { value: 'not_linked', label: t('vendors:notLinkedToUser') },
  ];

  const handleToggleStatus = async () => {
    if (!selectedVendor) return;

    try {
      await toggleStatusMutation({ id: selectedVendor.id, status: selectedVendor.status ? 0 : 1 });
      mutate();
      toast.success(t('vendors:statusUpdated'));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error(t('vendors:statusUpdateError'));
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedVendor(null);
    }
  };

  const openConfirmModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsConfirmModalOpen(true);
  };

  const handleCreate = () => {
    setEditingVendor(null);
    setShowModal(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowModal(true);
  };

  const isSearching = search !== debouncedSearch;

  // TODO: CHECK Invitation Status LOGIC
  const getInvitationStatus = (vendor: (typeof vendors)[0]) => {
    if (vendor.user_id) {
      return { label: t('vendors:accepted'), color: 'success' as const };
    }
    if (vendor.invitation_token && vendor.invitation_expires_at) {
      const expiresAt = new Date(vendor.invitation_expires_at);
      if (expiresAt > new Date()) {
        return { label: t('vendors:pending'), color: 'warning' as const };
      }
      return { label: t('vendors:expired'), color: 'error' as const };
    }
    return { label: t('vendors:notInvited'), color: 'light' as const };
  };

  return (
    <>
      <PageMeta title={t('vendors:title')} description={t('vendors:description')} />

      <div className="p-6">
        <PageHeader
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          statusOptions={statusOptions}
          userFilterOptions={userFilterOptions}
          isSearching={isSearching}
          onCreate={handleCreate}
        />

        {vendors.length === 0 ? (
          <EmptyState
            icon={<UserIcon className="h-12 w-12 text-gray-400" />}
            title={t('vendors:noVendorsFound')}
            description={
              search || statusFilter !== 'all' || userFilter !== 'all'
                ? t('vendors:noVendorsMatchFilters')
                : t('vendors:noVendorsCreated')
            }
            action={{
              label:
                search || statusFilter !== 'all' || userFilter !== 'all'
                  ? t('vendors:resetFilters')
                  : t('vendors:createVendor'),
              onClick:
                search || statusFilter !== 'all' || userFilter !== 'all'
                  ? () => {
                      setSearch('');
                      setStatusFilter('all');
                      setUserFilter('all');
                      setPage(1);
                    }
                  : handleCreate,
            }}
          />
        ) : (
          <>
            {/* Table for desktop */}
            <div
              className={`mt-8 hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block dark:border-gray-700 dark:bg-gray-800 ${isExpanded ? 'lg:hidden xl:block' : ''} `}
            >
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                </div>
              )}
              <Table className="min-w-[1000px]">
                <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-700/50">
                  <TableRow>
                    <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                      {t('vendors:nameColumn')}
                    </TableCell>
                    <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                      {t('vendors:emailColumn')}
                    </TableCell>
                    <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                      {t('vendors:phoneColumn')}
                    </TableCell>
                    <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                      {t('vendors:taxNumberColumn')}
                    </TableCell>
                    <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                      {t('vendors:invitationStatus')}
                    </TableCell>
                    <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                      {t('common:status')}
                    </TableCell>
                    <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                      {t('common:actions')}
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 text-center dark:divide-gray-700">
                  {vendors.map((vendor) => {
                    const invitationStatus = getInvitationStatus(vendor);
                    return (
                      <TableRow
                        key={vendor.id}
                        className="transition-colors duration-150 hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                      >
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900 dark:text-white/90">
                            {i18n.language === 'en' ? vendor.name_en : vendor.name_ar}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-gray-700 dark:text-gray-300">{vendor.email}</TableCell>
                        <TableCell className="py-4 text-gray-700 dark:text-gray-300">{vendor.phone_number}</TableCell>
                        <TableCell className="py-4 text-gray-700 dark:text-gray-300">
                          {vendor.tax_number || '-'}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge variant="light" color={invitationStatus.color}>
                            {invitationStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge
                            variant="light"
                            color={vendor.status === 1 ? 'success' : 'error'}
                            onClick={() => openConfirmModal(vendor)}
                          >
                            {vendor.status === 1 ? t('common:active') : t('common:inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/vendors/${vendor.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              title={t('vendors:viewDetails')}
                            >
                              <UserIcon className="h-4 w-4" />
                              {t('vendors:viewDetails')}
                            </Link>
                            <button
                              onClick={() => handleEdit(vendor)}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                              title={t('common:edit')}
                            >
                              <PencilIcon className="h-4 w-4" />
                              {t('common:edit')}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Cards for mobile */}
            <div className={`mt-6 grid grid-cols-1 gap-4 lg:hidden ${isExpanded ? 'lg:!grid xl:!hidden' : ''} `}>
              {vendors.map((vendor) => {
                const invitationStatus = getInvitationStatus(vendor);
                return (
                  <div
                    key={vendor.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                          {i18n.language === 'en' ? vendor.name_en : vendor.name_ar}
                        </h2>
                      </div>
                      <Badge
                        variant="light"
                        color={vendor.status === 1 ? 'success' : 'error'}
                        onClick={() => openConfirmModal(vendor)}
                      >
                        {vendor.status === 1 ? t('common:active') : t('common:inactive')}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {t('vendors:emailColumn')}:
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {t('vendors:phoneColumn')}:
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{vendor.phone_number}</span>
                      </div>
                      {vendor.tax_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {t('vendors:taxNumberColumn')}:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">{vendor.tax_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {t('vendors:invitationStatus')}:
                        </span>
                        <Badge variant="light" color={invitationStatus.color}>
                          {invitationStatus.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                      <Link
                        to={`/vendors/${vendor.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <UserIcon className="h-4 w-4" />
                        {t('vendors:viewDetails')}
                      </Link>
                      <Button onClick={() => handleEdit(vendor)} size="sm" className="flex-1">
                        <PencilIcon className="h-4 w-4" />
                        {t('common:edit')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('common:showing')} {from}-{to} {t('common:of')} {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('common:prev')}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-2"
                  >
                    {t('common:next')}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <VendorModal
            vendor={editingVendor}
            onClose={() => {
              setShowModal(false);
              setEditingVendor(null);
            }}
            onSave={() => {
              mutate();
              setShowModal(false);
              setEditingVendor(null);
            }}
          />
        )}

        {/* Confirm Status Toggle Modal */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleToggleStatus}
          title={
            selectedVendor?.status === 1
              ? t('vendors:deactivateConfirmTitle', 'Deactivate Vendor')
              : t('vendors:activateConfirmTitle', 'Activate Vendor')
          }
          message={
            selectedVendor?.status === 1
              ? t('vendors:deactivateConfirm', {
                  vendor: i18n.language === 'en' ? selectedVendor?.name_en : selectedVendor?.name_ar,
                })
              : t('vendors:activateConfirm', {
                  vendor: i18n.language === 'en' ? selectedVendor?.name_en : selectedVendor?.name_ar,
                })
          }
          confirmText={selectedVendor?.status === 1 ? t('common:deactivate') : t('common:activate')}
          cancelText={t('common:cancel')}
          variant={selectedVendor?.status === 1 ? 'danger' : 'success'}
          isLoading={isToggling}
        />
      </div>
    </>
  );
};
