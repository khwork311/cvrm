import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { VendorGroup } from './api/vendor-groups.api';
import { useCreateVendorGroup, useDeleteVendorGroup, useUpdateVendorGroup, useVendorGroups } from './hooks';
import { getVendorGroupSchema, type VendorGroupFormData } from './schemas';

export const VendorGroupsList = () => {
  const { t, ready } = useTranslation(['vendorGroups', 'common']);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VendorGroup | null>(null);

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search);

  // TODO: Get company_id from auth context or route params
  // Fetch vendor groups with SWR using debounced search
  const { data, isLoading, mutate } = useVendorGroups({
    search: debouncedSearch ? debouncedSearch : undefined,
    page,
    limit: PAGE_LIMIT,
  });
  const { trigger: deleteGroupMutation } = useDeleteVendorGroup();

  const vendorGroups = data?.data?.data || [];
  const paginationData = data?.data;
  const total = paginationData?.total || 0;
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from ?? 0;
  const to = paginationData?.to ?? 0;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor group?')) {
      return;
    }
    try {
      await deleteGroupMutation(id);
      mutate();
    } catch (error) {
      console.error('Failed to delete vendor group:', error);
    }
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setShowModal(true);
  };

  const handleEdit = (group: VendorGroup) => {
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  // Show initial loading only on first load
  const isInitialLoading = isLoading && !data;

  return (
    <>
      <PageMeta
        title={ready ? t('vendorGroups:title') : 'Vendor groups'}
        description={ready ? t('vendorGroups:description') : 'Manage and organize vendor groups'}
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
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{t('vendorGroups:title')}</h1>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('vendorGroups:searchPlaceholder')}
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

              <button
                onClick={handleCreate}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                + {t('vendorGroups:createNew')}
              </button>

              <Link
                to="/vendor-groups/assign"
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                {t('vendorGroups:assignVendor')}
              </Link>
            </div>
          </div>

          {/* Table for desktop */}
          <div className="relative mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
            <Table className="min-w-[800px]">
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendorGroups:nameEnColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendorGroups:nameArColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendorGroups:createdAtColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('common:actions')}
                  </TableCell>
                </TableRow>
              </TableHeader>

              {isLoading && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={12} className="py-10 text-center">
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {vendorGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="text-theme-sm px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                      {group.name_en}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                      <div dir="auto">{group.name_ar}</div>
                    </TableCell>

                    <TableCell className="text-theme-xs px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                      {group.created_at || '-'}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <TableActionsDropdown
                        actions={
                          [
                            {
                              label: t('common:edit'),
                              onClick: () => handleEdit(group),
                              icon: <PencilIcon className="h-4 w-4" />,
                              variant: 'primary',
                            },
                            {
                              label: t('common:delete'),
                              onClick: () => handleDelete(group.id),
                              variant: 'danger',
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
            {vendorGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{group.name_en}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400" dir="auto">{group.name_ar}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('vendorGroups:createdAtColumn')}:</span>
                    <span className="text-gray-600 dark:text-gray-400">{group.created_at || '-'}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(group)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    {t('common:edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {t('common:delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show "no data" message only when not using dummy data and no real data exists */}
          {vendorGroups.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
              <img src="/images/error/404-dark.svg" alt="404" className="hidden dark:block" />
              <p className="text-center text-2xl font-semibold text-gray-500 dark:text-gray-400">
                {t('vendorGroups:noGroupsFound')}
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
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <VendorGroupModal
          group={editingGroup}
          onClose={() => {
            setShowModal(false);
            setEditingGroup(null);
          }}
          onSave={() => {
            mutate();
            setShowModal(false);
            setEditingGroup(null);
          }}
        />
      )}
    </>
  );
};

// Vendor Group Modal Component
interface VendorGroupModalProps {
  group: VendorGroup | null;
  onClose: () => void;
  onSave: () => void;
}

const VendorGroupModal: React.FC<VendorGroupModalProps> = ({ group, onClose, onSave }) => {
  const { t } = useTranslation(['vendorGroups', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { trigger: createTrigger } = useCreateVendorGroup();
  const { trigger: updateTrigger } = useUpdateVendorGroup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorGroupFormData>({
    resolver: zodResolver(getVendorGroupSchema()),
    defaultValues: {
      name_en: group?.name_en || '',
      name_ar: group?.name_ar || '',
      status: group?.status || 1,
    },
  });

  const onSubmit = async (data: VendorGroupFormData) => {
    try {
      setIsSubmitting(true);

      if (group) {
        await updateTrigger({ id: group.id, data });
        toast.success(t('vendorGroups:updateSuccess', 'Vendor group updated successfully'));
      } else {
        await createTrigger(data);
        toast.success(t('vendorGroups:createSuccess', 'Vendor group created successfully'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving vendor group:', error);

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(errorMessages);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = group
          ? t('vendorGroups:updateError', 'Failed to update vendor group')
          : t('vendorGroups:createError', 'Failed to create vendor group');
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
          {group ? t('vendorGroups:editGroup') : t('vendorGroups:createNew')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name EN */}
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendorGroups:groupNameEn')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_en')}
                type="text"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_en && <p className="mt-1 text-xs text-red-500">{errors.name_en.message}</p>}
            </div>

            {/* Name AR */}
            <div>
              <label htmlFor="name_ar" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendorGroups:groupNameAr')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_ar')}
                type="text"
                dir="rtl"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
              className="flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
