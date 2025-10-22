import PageMeta from '@/components/common/PageMeta';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { GroupIcon, PencilIcon, PlusIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CustomerGroup } from './api/customer-groups.api';
import {
  useCreateCustomerGroup,
  useCustomerGroups,
  useToggleCustomerGroupStatus,
  useUpdateCustomerGroup,
} from './hooks';
import { getCustomerGroupSchema, type CustomerGroupFormData } from './schemas';
interface Option {
  value: string;
  label: string;
}

type StatusFilter = 'all' | '1' | '0';

export const CustomerGroupsList = () => {
  const { t, ready } = useTranslation(['customerGroups', 'common']);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search);

  // Fetch customer groups with SWR using debounced search
  const { data, isLoading, mutate } = useCustomerGroups({
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit: PAGE_LIMIT,
  });
  const { trigger: toggleStatusMutation } = useToggleCustomerGroupStatus();

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

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatusMutation(id);
      // Revalidate the data after mutation
      mutate();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to toggle status');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (group: CustomerGroup) => {
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setShowModal(true);
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  // Show initial loading only on first load
  const isInitialLoading = isLoading && !data;

  return (
    <>
      <PageMeta
        title={ready ? t('customerGroups:title') : 'Customer groups'}
        description={ready ? t('customerGroups:description') : 'Manage and organize customer groups'}
      />

      {/* Show loading state only on initial load */}
      {!ready || isInitialLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      ) : (
        <div className="p-6">
          {/* Header + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{t('customerGroups:title')}</h1>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('customerGroups:searchPlaceholder')}
                  value={search}
                  onChange={handleSearch}
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
                placeholder={t('customerGroups:filterStatus')}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                className="dark:bg-dark-900"
              />

              <button
                onClick={handleCreate}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                + {t('customerGroups:createNew')}
              </button>
            </div>
          </div>

          {/* Table for desktop */}
          <div className="relative mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
            {/* Loading overlay when refetching data */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
              </div>
            )}
            <Table className="min-w-[800px]">
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('customerGroups:nameEnColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('customerGroups:nameArColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('customerGroups:createdAtColumn')}
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

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {customerGroups?.map((group) => (
                  <TableRow key={group?.id}>
                    <TableCell className="text-theme-sm px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                      {group.name_en}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                      <div dir="auto">{group.name_ar}</div>
                    </TableCell>

                    <TableCell className="text-theme-xs px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                      {group.created_at || '-'}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-center">
                      <Badge variant="light" color="success" onClick={() => handleToggleStatus(group.id)}>
                        {t('common:active')}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <TableActionsDropdown
                        actions={
                          [
                            {
                              label: t('customerGroups:viewCustomers', 'View Customers'),
                              to: `/customer-groups/${group.id}/customers`,
                              icon: <GroupIcon className="h-4 w-4" />,
                              variant: 'primary',
                            },
                            {
                              label: t('common:edit'),
                              onClick: () => handleEdit(group),
                              icon: <PencilIcon className="h-4 w-4" />,
                              variant: 'primary',
                            },
                            {
                              label: t('common:assign'),
                              to: `/customer-groups/${group.id}/assign`,
                              icon: <PlusIcon className="h-4 w-4" />,
                              variant: 'primary',
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

          {/* Cards for mobile */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
            {customerGroups?.map((group) => (
              <div
                key={group?.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{group.name_en}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400" dir="auto">
                      {group.name_ar}
                    </p>
                  </div>
                  <Badge variant="light" color="success" onClick={() => handleToggleStatus(group.id)}>
                    {t('common:active')}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {t('customerGroups:createdAtColumn')}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{group.created_at || '-'}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <Link
                    to={`/customer-groups/${group.id}/customers`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <GroupIcon className="h-4 w-4" />
                    {t('customerGroups:viewCustomers', 'View Customers')}
                  </Link>
                  <button
                    onClick={() => handleEdit(group)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    {t('common:edit')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show "no data" message only when not using dummy data and no real data exists */}
          {customerGroups.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
              <img src="/images/error/404-dark.svg" alt="404" className="hidden dark:block" />
              <p className="text-center text-2xl font-semibold text-gray-500 dark:text-gray-400">
                {t('customerGroups:noGroupsFound')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
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

          {/* Modal for Create/Edit */}
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
        </div>
      )}
    </>
  );
};

// Customer Group Modal Component
interface CustomerGroupModalProps {
  group: CustomerGroup | null;
  onClose: () => void;
  onSave: () => void;
}

const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({ group, onClose, onSave }) => {
  const { t } = useTranslation(['customerGroups', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);
  const toast = useToast();

  const { trigger: createTrigger } = useCreateCustomerGroup();
  const { trigger: updateTrigger } = useUpdateCustomerGroup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerGroupFormData>({
    resolver: zodResolver(getCustomerGroupSchema()),
    defaultValues: {
      company_id: 1,
      name_en: group?.name_en || '',
      name_ar: group?.name_ar || '',
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
          {apiErrors && Object.keys(apiErrors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    {t('common:validationError', 'Please fix the following errors:')}
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                    {Object.entries(apiErrors).map(([field, messages]) =>
                      messages.map((message, idx) => (
                        <li key={`${field}-${idx}`} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400"></span>
                          <span>
                            <strong className="font-medium">{field}:</strong> {message}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

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
