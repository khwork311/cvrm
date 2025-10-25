import { EmptyState } from '@/components/common/EmptyState';
import { ValidationErrors } from '@/components/common/ErrorDisplay';
import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { GroupIcon, PencilIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CustomerGroup } from './api/customer-groups.api';
import { PageHeader } from './components/PageHeader';
import {
  useCreateCustomerGroup,
  useCustomerGroups,
  useToggleCustomerGroupStatus,
  useUpdateCustomerGroup,
} from './hooks';
import { CustomerGroupFormData, getCustomerGroupSchema } from './schemas';

interface Option {
  value: string;
  label: string;
}

export const CustomerGroupsList = () => {
  const { t, ready, i18n } = useTranslation(['customerGroups', 'common']);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, mutate } = useCustomerGroups({
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: PAGE_LIMIT,
  });
  const { trigger: toggleStatusMutation, isMutating: togglingStatus } = useToggleCustomerGroupStatus();

  const customerGroups = data?.data?.data || [];
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

  const handleToggleStatus = async () => {
    if (!selectedGroup) return;

    try {
      await toggleStatusMutation({ id: selectedGroup.id, status: selectedGroup.status ? 0 : 1 });
      mutate();
      toast.success(t('customerGroups:statusUpdated'));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error(t('customerGroups:statusUpdateError'));
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedGroup(null);
    }
  };

  const openConfirmModal = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setIsConfirmModalOpen(true);
  };

  const handleEdit = (group: CustomerGroup) => {
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setShowModal(true);
  };

  const isSearching = search !== debouncedSearch;
  const isInitialLoading = isLoading && !data;

  return (
    <>
      <PageMeta
        title={ready ? t('customerGroups:title') : 'Customer groups'}
        description={ready ? t('customerGroups:description') : 'Manage and organize customer groups'}
      />

      {!ready || isInitialLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      ) : (
        <div className="p-6">
          <PageHeader
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions}
            isSearching={isSearching}
            onCreate={handleCreate}
          />

          {customerGroups.length === 0 ? (
            <EmptyState
              icon={<GroupIcon className="h-12 w-12 text-gray-400" />}
              title={t('customerGroups:noGroupsFound')}
              description={
                search || statusFilter !== 'all'
                  ? t('customerGroups:noGroupsMatchFilters')
                  : t('customerGroups:noGroupsCreated')
              }
              action={{
                label:
                  search || statusFilter !== 'all' ? t('customerGroups:resetFilters') : t('customerGroups:createGroup'),
                onClick:
                  search || statusFilter !== 'all'
                    ? () => {
                        setSearch('');
                        setStatusFilter('all');
                        setPage(1);
                      }
                    : () => setShowModal(true),
              }}
            />
          ) : (
            <>
              {/* Table for desktop */}
              <div className="mt-8 hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-800">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                  </div>
                )}
                <Table className="min-w-[800px]">
                  <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-700/50">
                    <TableRow>
                      <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                        {t('customerGroups:nameColumn')}
                      </TableCell>
                      <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                        {t('customerGroups:customersCount')}
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
                    {customerGroups.map((group) => (
                      <TableRow
                        key={group.id}
                        className="transition-colors duration-150 hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                      >
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900 dark:text-white/90">
                            {i18n.language === 'en' ? group.name_en : group.name_ar}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Link
                            to={`/customer-groups/${group.id}/customers`}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                          >
                            <GroupIcon className="h-4 w-4" />
                            {t('customerGroups:viewCustomers')}
                          </Link>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge
                            variant="light"
                            color={group.status ? 'success' : 'error'}
                            onClick={() => openConfirmModal(group)}
                          >
                            {group.status ? t('common:active') : t('common:inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/customer-groups/${group.id}/assign`}
                              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-700 hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                              title={t('customerGroups:assignCustomers')}
                            >
                              +
                            </Link>
                            <div title={t('common:edit')}>
                              <Button onClick={() => handleEdit(group)} size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cards for mobile */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
                {customerGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                          {i18n.language === 'en' ? group.name_en : group.name_ar}
                        </h2>
                      </div>
                      <Badge
                        variant="light"
                        color={group.status ? 'success' : 'error'}
                        onClick={() => openConfirmModal(group)}
                      >
                        {group.status ? t('common:active') : t('common:inactive')}
                      </Badge>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                      <Link
                        to={`/customer-groups/${group.id}/customers`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        {t('customerGroups:viewCustomers')}
                      </Link>
                      <Link
                        to={`/customer-groups/${group.id}/assign`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        {t('customerGroups:assignCustomers')}
                      </Link>
                      <Button onClick={() => handleEdit(group)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
            <CustomerGroupModal
              group={editingGroup}
              onClose={() => setShowModal(false)}
              onSave={() => {
                mutate();
                setShowModal(false);
                setEditingGroup(null);
              }}
            />
          )}

          {/* Confirm Status Toggle Modal */}
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleToggleStatus}
            title={
              selectedGroup?.status
                ? t('customerGroups:deactivateConfirmTitle', 'Deactivate Customer Group')
                : t('customerGroups:activateConfirmTitle', 'Activate Customer Group')
            }
            message={
              selectedGroup?.status
                ? t('customerGroups:deactivateConfirm', {
                    group: i18n.language === 'en' ? selectedGroup?.name_en : selectedGroup?.name_ar,
                  })
                : t('customerGroups:activateConfirm', {
                    group: i18n.language === 'en' ? selectedGroup?.name_en : selectedGroup?.name_ar,
                  })
            }
            confirmText={selectedGroup?.status ? t('common:deactivate') : t('common:activate')}
            cancelText={t('common:cancel')}
            variant={selectedGroup?.status ? 'danger' : 'success'}
            isLoading={togglingStatus}
          />
        </div>
      )}
    </>
  );
};

// Customer Group Modal Component
interface CustomerGroupModalProps {
  group: Pick<CustomerGroup, 'id' | 'name_en' | 'name_ar' | 'status'> | null;
  onClose: () => void;
  onSave: () => void;
}

const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({ group, onClose, onSave }) => {
  const { t } = useTranslation(['customerGroups', 'common']);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);
  const toast = useToast();

  const { trigger: createTrigger } = useCreateCustomerGroup();
  const { trigger: updateTrigger } = useUpdateCustomerGroup();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerGroupFormData>({
    resolver: zodResolver(getCustomerGroupSchema()),
    defaultValues: {
      company_id: user?.company_id,
      name_en: group?.name_en || '',
      name_ar: group?.name_ar || '',
      status: group?.status ?? 1,
    },
  });

  const onSubmit = async (data: CustomerGroupFormData) => {
    try {
      setIsSubmitting(true);
      setApiErrors(null); // Clear previous errors

      if (group) {
        // Update existing group
        await updateTrigger({ id: group.id, data });
        toast.success(t('customerGroups:updateSuccess', 'Customer group updated successfully'));
      } else {
        // Create new group
        await createTrigger(data as any);
        toast.success(t('customerGroups:createSuccess', 'Customer group created successfully'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving customer group:', error);

      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
        toast.error(t('common:validationError', 'Please fix the errors below'));
      } else if (error?.response?.data?.message) {
        // Handle single error message
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        const errorMessage = group
          ? t('customerGroups:updateError', 'Failed to update customer group')
          : t('customerGroups:createError', 'Failed to create customer group');
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {group
            ? t('customerGroups:updateGroup', 'Edit Customer Group')
            : t('customerGroups:createNew', 'Create Customer Group')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* API Error Summary */}
          {apiErrors && <ValidationErrors errors={apiErrors} />}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name EN */}
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customerGroups:groupNameEn')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_en')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_en && <p className="mt-1 text-xs text-red-500">{errors.name_en.message}</p>}
            </div>

            {/* Name AR */}
            <div>
              <label htmlFor="name_ar" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customerGroups:groupNameAr')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_ar && <p className="mt-1 text-xs text-red-500">{errors.name_ar.message}</p>}
            </div>
            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('common:status')} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <option value="1">{t('common:active')}</option>
                    <option value="0">{t('common:inactive')}</option>
                  </select>
                )}
              />
              {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t('common:saving', 'Saving...')
                : group
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
