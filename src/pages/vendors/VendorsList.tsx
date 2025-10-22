import PageMeta from '@/components/common/PageMeta';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Vendor } from './api/vendors.api';
import { useCreateVendor, useToggleVendorStatus, useUpdateVendor, useVendors } from './hooks';
import { vendorSchema, type VendorFormData } from './schemas';

interface Option {
  value: string;
  label: string;
}

type StatusFilter = 'all' | '1' | '0';
type UserFilter = 'all' | 'linked' | 'not_linked';

export const VendorsList = () => {
  const { t, ready } = useTranslation(['vendors', 'common']);
  const { user } = useAuth();
  console.log('user', user);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // TODO: Get company_id from auth context or route params
  const companyId = user?.id; // Placeholder

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, mutate, error } = useVendors({
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? Number(statusFilter) : undefined,
    has_user: userFilter === 'linked' ? true : userFilter === 'not_linked' ? false : undefined,
    page,
    per_page: PAGE_LIMIT,
    company_id: companyId!,
  });

  const { trigger: toggleStatusMutation } = useToggleVendorStatus();

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

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatusMutation(id);
      mutate();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleCreate = () => {
    setEditingVendor(null);
    setShowModal(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowModal(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const isSearching = search !== debouncedSearch;
  const isInitialLoading = isLoading && !data;

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
      <PageMeta
        title={ready ? t('vendors:title') : 'Vendors'}
        description={ready ? t('vendors:description') : 'Manage vendors'}
      />

      {!ready || isInitialLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:title')}</h1>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('vendors:searchPlaceholder')}
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
                placeholder={t('vendors:filterStatus')}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                className="dark:bg-dark-900"
              />

              <Select
                options={userFilterOptions}
                defaultValue="all"
                placeholder={t('vendors:filterUser')}
                onChange={(value) => setUserFilter(value as UserFilter)}
                className="dark:bg-dark-900"
              />

              <button
                onClick={handleCreate}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                + {t('vendors:createVendor')}
              </button>
            </div>
          </div>

          {/* Table for desktop */}
          <div className="relative mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
            {isLoading && data && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
              </div>
            )}
            <Table className="min-w-[1000px]">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendors:nameColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendors:emailColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendors:phoneColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendors:taxNumberColumn')}
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                  >
                    {t('vendors:invitationStatus')}
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
                {vendors.map((vendor) => {
                  const invitationStatus = getInvitationStatus(vendor);
                  return (
                    <TableRow key={vendor.id}>
                      <TableCell className="text-theme-sm px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                        <Link to={`/vendors/${vendor.id}`} className="hover:text-blue-500">
                          {vendor.name_en}
                        </Link>
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                        {vendor.email}
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                        {vendor.phone_number}
                      </TableCell>

                      <TableCell className="text-theme-xs px-5 py-4 text-start text-gray-600 dark:text-gray-400">
                        {vendor.tax_number || '-'}
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-4 text-center">
                        <Badge variant="light" color={invitationStatus.color}>
                          {invitationStatus.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-4 text-center">
                        <Badge variant="light" color={vendor.status === 1 ? 'success' : 'error'}>
                          {vendor.status === 1 ? t('common:active') : t('common:inactive')}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-center">
                        <TableActionsDropdown
                          actions={
                            [
                              {
                                label: t('common:edit'),
                                onClick: () => handleEdit(vendor),
                                icon: <PencilIcon className="h-4 w-4" />,
                                variant: 'primary',
                              },
                              {
                                label: t('vendors:viewDetails'),
                                to: `/vendors/${vendor.id}`,
                                variant: 'primary',
                              },
                              !vendor.user_id && {
                                label: vendor.invitation_token
                                  ? t('vendors:resendInvitation')
                                  : t('vendors:sendInvitation'),
                                to: `/vendors/${vendor.id}/invite`,
                                variant: 'success',
                              },
                              vendor.invitation_token &&
                                !vendor.user_id && {
                                  label: t('vendors:copyInviteLink'),
                                  onClick: () => {
                                    // TODO: Implement copy to clipboard
                                    console.log('Copy invite link for vendor', vendor.id);
                                  },
                                  variant: 'primary',
                                },
                              {
                                label: vendor.status === 1 ? t('common:deactivate') : t('common:activate'),
                                onClick: () => handleToggleStatus(vendor.id),
                                variant: vendor.status === 1 ? 'danger' : 'success',
                              },
                            ].filter(Boolean) as TableAction[]
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Cards for mobile */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
            {vendors.map((vendor) => {
              const invitationStatus = getInvitationStatus(vendor);
              return (
                <div
                  key={vendor.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link to={`/vendors/${vendor.id}`} className="hover:text-blue-500">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{vendor.name_en}</h2>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.name_ar || '-'}</p>
                    </div>
                    <Badge variant="light" color={vendor.status === 1 ? 'success' : 'error'}>
                      {vendor.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">📧</span>
                      <span className="text-gray-600 dark:text-gray-400">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">📞</span>
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
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                      {t('common:edit')}
                    </button>
                    <Link
                      to={`/vendors/${vendor.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      {t('vendors:viewDetails')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {vendors.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <p className="text-center text-2xl font-semibold text-gray-500 dark:text-gray-400">
                {t('vendors:noVendorsFound')}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {t('vendors:errorLoadingVendors')}
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
    </>
  );
};

// Vendor Modal Component
interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: () => void;
}

const VendorModal: React.FC<VendorModalProps> = ({ vendor, onClose, onSave }) => {
  const { t } = useTranslation(['vendors', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { trigger: createTrigger } = useCreateVendor();
  const { trigger: updateTrigger } = useUpdateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name_en: vendor?.name_en || '',
      name_ar: vendor?.name_ar || '',
      phone_number: vendor?.phone_number || '',
      email: vendor?.email || '',
      tax_number: vendor?.tax_number || '',
      status: vendor?.status === 1 ? 'active' : 'inactive',
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      setIsSubmitting(true);

      const apiData = {
        name_en: data.name_en,
        name_ar: data.name_ar || '',
        email: data.email,
        phone_number: data.phone_number,
        tax_number: data.tax_number || '',
        status: data.status === 'active' ? 1 : 0,
        role_id: 3, // Vendor role
        group_ids: [1], // Default group
      };

      if (vendor) {
        await updateTrigger({ id: vendor.id, data: apiData });
        toast.success(t('vendors:updateSuccess', 'Vendor updated successfully'));
      } else {
        await createTrigger(apiData);
        toast.success(t('vendors:createSuccess', 'Vendor created successfully'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving vendor:', error);

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(errorMessages);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = vendor
          ? t('vendors:updateError', 'Failed to update vendor')
          : t('vendors:createError', 'Failed to create vendor');
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
          {vendor ? t('vendors:editVendor') : t('vendors:createVendor')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name EN */}
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:nameEn')} <span className="text-red-500">*</span>
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
                {t('vendors:nameAr')}
              </label>
              <input
                {...register('name_ar')}
                type="text"
                dir="rtl"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_ar && <p className="mt-1 text-xs text-red-500">{errors.name_ar.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:email')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                {t('vendors:phoneNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone_number')}
                type="tel"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>}
            </div>

            {/* Tax Number */}
            <div>
              <label htmlFor="tax_number" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('vendors:taxNumber')}
              </label>
              <input
                {...register('tax_number')}
                type="text"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.tax_number && <p className="mt-1 text-xs text-red-500">{errors.tax_number.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('common:status')}
              </label>
              <select
                {...register('status')}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="active">{t('common:active')}</option>
                <option value="inactive">{t('common:inactive')}</option>
              </select>
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
              className="flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t('common:saving', 'Saving...')
                : vendor
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
