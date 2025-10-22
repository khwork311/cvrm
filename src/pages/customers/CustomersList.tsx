import PageMeta from '@/components/common/PageMeta';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { PencilIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/useDebounce';
import { useCustomers, useToggleCustomerStatus, useCreateCustomer, useUpdateCustomer } from './hooks/useCustomers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getCustomerSchema, type CustomerFormData } from './schemas';
import type { Customer } from './api/customers.api';
import { useAuth } from '@/hooks/useAuth';

interface Option {
  value: string;
  label: string;
}

type StatusFilter = 'all' | '1' | '0';

export const CustomersList = () => {
  const { t } = useTranslation(['customers', 'common']);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    customerId: number | null;
    action: 'activate' | 'deactivate' | null;
  }>({ isOpen: false, customerId: null, action: null });

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, mutate } = useCustomers({
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? Number(statusFilter) : undefined,
    page,
    per_page: PAGE_LIMIT,
  });
  const { trigger: toggleTrigger, isMutating: isToggling } = useToggleCustomerStatus();

  const customers = data?.data?.data;
  const paginationData = data?.data;
  const total = paginationData?.total || 0;
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from ?? 0;
  const to = paginationData?.to ?? 0;

  const statusOptions: Option[] = [
    { value: 'all', label: t('common:all') },
    { value: '1', label: t('common:active') },
    { value: '0', label: t('common:notActive') },
  ];

  const handleToggleStatus = (id: number, currentStatus: 'active' | 'not active') => {
    setConfirmModal({
      isOpen: true,
      customerId: id,
      action: currentStatus ? 'deactivate' : 'activate',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.customerId || !confirmModal.action) return;

    try {
      await toggleTrigger({ id: confirmModal.customerId, status: confirmModal.action === 'activate' ? 1 : 0 });
      const successMessage =
        confirmModal.action === 'activate' ? t('customers:activateSuccess') : t('customers:deactivateSuccess');
      toast.success(successMessage);
      // Refresh the data
      mutate();
    } catch (error) {
      const errorMessage =
        confirmModal.action === 'activate' ? t('customers:activateError') : t('customers:deactivateError');
      toast.error(errorMessage);
      console.error('Error toggling customer status:', error);
    } finally {
      setConfirmModal({ isOpen: false, customerId: null, action: null });
    }
  };

  const handleCloseModal = () => {
    if (!isToggling) {
      setConfirmModal({ isOpen: false, customerId: null, action: null });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  return (
    <>
      <PageMeta title={t('customers:title', 'Customers')} description={t('customers:title', 'Customers')} />
      <div className="p-6">
        {/* Header + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
            {t('customers:title', 'Customers')}
          </h1>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={t('customers:searchPlaceholder', 'Search by name, phone, email, or tax number...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              placeholder={t('customers:filterStatus', 'Filter by status')}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              className="dark:bg-dark-900"
            />

            <button
              onClick={handleCreate}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              + {t('customers:createNew', 'Create Customer')}
            </button>
          </div>
        </div>

        {/* Table for desktop */}
        <div className="mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-700">
          <Table className="min-w-[1000px]">
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('customers:nameColumn', 'Customer Name')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('customers:phoneColumn', 'Phone Number')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('customers:emailColumn', 'Email')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('customers:taxNumberColumn', 'Tax Number')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('common:status', 'Status')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('common:actions', 'Actions')}
                </TableCell>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">
                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {customers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {customer.name_en}
                      </div>
                      <div className="text-theme-xs text-gray-500 dark:text-gray-400">{customer.name_ar}</div>
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                      {customer.phone_number}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                      {customer.email || customer.user?.email || '-'}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                      {customer.tax_number}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-center">
                      <Badge
                        variant="light"
                        color={customer.status ? 'success' : 'error'}
                        onClick={() => handleToggleStatus(customer.id, customer.status ? 'not active' : 'active')}
                      >
                        {customer.status ? t('common:active') : t('common:inactive')}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <TableActionsDropdown
                        actions={
                          [
                            {
                              label: t('common:edit'),
                              onClick: () => handleEdit(customer),
                              icon: <PencilIcon className="h-4 w-4" />,
                              variant: 'primary',
                            },
                            {
                              label: customer.status ? t('common:deactivate') : t('common:activate'),
                              onClick: () => handleToggleStatus(customer.id, customer.status ? 'not active' : 'active'),
                              variant: customer.status ? 'danger' : 'success',
                            },
                          ] as TableAction[]
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>

        {/* Cards for mobile */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
          {customers?.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{customer.name_en}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{customer.name_ar}</p>
                </div>
                <Badge
                  variant="light"
                  color={customer.status ? 'success' : 'error'}
                  onClick={() => handleToggleStatus(customer.id, customer.status ? 'not active' : 'active')}
                >
                  {customer.status ? t('common:active') : t('common:inactive')}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">📞</span>
                  <span className="text-gray-600 dark:text-gray-400">{customer.phone_number}</span>
                </div>
                {(customer.email || customer.user?.email) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">📧</span>
                    <span className="text-gray-600 dark:text-gray-400">{customer.email || customer.user?.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('common:taxNumber')}:</span>
                  <span className="text-gray-600 dark:text-gray-400">{customer.tax_number}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(customer)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4" />
                  {t('common:edit')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {customers?.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
            <img src="/images/error/404-dark.svg" alt="404" className="hidden dark:block" />
            <p className="text-center text-2xl font-semibold text-gray-500 dark:text-gray-400">
              {t('customers:noCustomersFound', 'No customers found')}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.action === 'activate'
            ? t('customers:activateConfirmTitle')
            : t('customers:deactivateConfirmTitle')
        }
        message={
          confirmModal.action === 'activate'
            ? t('customers:activateConfirmMessage')
            : t('customers:deactivateConfirmMessage')
        }
        confirmText={confirmModal.action === 'activate' ? t('common:activate') : t('common:deactivate')}
        cancelText={t('common:cancel')}
        variant={confirmModal.action === 'activate' ? 'success' : 'danger'}
        isLoading={isToggling}
      />

      {/* Modal for Create/Edit */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setShowModal(false)}
          onSave={() => {
            mutate();
            setShowModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </>
  );
};

// Customer Modal Component
interface CustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave }) => {
  const { t } = useTranslation(['customers', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]> | null>(null);
  const { user } = useAuth();
  const userId = user?.id ?? 1;
  const toast = useToast();

  const { trigger: createTrigger } = useCreateCustomer();
  const { trigger: updateTrigger } = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(getCustomerSchema()),
    defaultValues: {
      name_en: customer?.name_en || '',
      name_ar: customer?.name_ar || '',
      phone_number: customer?.phone_number || '',
      email: customer?.email || customer?.user?.email || '',
      tax_number: customer?.tax_number || '',
      customer_group_id: customer?.customer_group_id || 1,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      setApiErrors(null); // Clear previous errors

      if (customer) {
        // Update existing customer
        const updateData = {
          company_id: customer.company_id || 1,
          name_en: data.name_en,
          name_ar: data.name_ar,
          phone_number: data.phone_number,
          email: data.email,
          tax_number: data.tax_number,
          role_id: customer.user?.role?.id || 3,
          name: data.name_en,
        };
        await updateTrigger({ id: customer.id, data: updateData });
        toast.success(t('customers:updateSuccess', 'Customer updated successfully'));
      } else {
        // Create new customer
        const createData = {
          company_id: userId,
          role_id: 3,
          name: data.name_en,
          password: '123456',
          name_en: data.name_en,
          name_ar: data.name_ar,
          phone_number: data.phone_number,
          email: data.email,
          tax_number: data.tax_number,
          group_id: data.customer_group_id,
          status: 1,
        };
        await createTrigger(createData);
        toast.success(t('customers:createSuccess', 'Customer created successfully'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      
      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
        toast.error(t('common:validationError', 'Please fix the errors below'));
      } else if (error?.response?.data?.message) {
        // Handle single error message
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        const errorMessage = customer
          ? t('customers:updateError', 'Failed to update customer')
          : t('customers:createError', 'Failed to create customer');
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
          {customer ? t('customers:editCustomer', 'Edit Customer') : t('customers:createNew', 'Create Customer')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* API Error Summary */}
          {apiErrors && Object.keys(apiErrors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    {t('common:validationError', 'Please fix the following errors:')}
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                    {Object.entries(apiErrors).map(([field, messages]) => (
                      messages.map((message, idx) => (
                        <li key={`${field}-${idx}`} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400"></span>
                          <span><strong className="font-medium">{field}:</strong> {message}</span>
                        </li>
                      ))
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name EN */}
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customers:nameEn')} <span className="text-red-500">*</span>
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
                {t('customers:nameAr')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.name_ar && <p className="mt-1 text-xs text-red-500">{errors.name_ar.message}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customers:phoneNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone_number')}
                type="tel"
                placeholder="+966501234567"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('customers:email')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="customer@example.com"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Tax Number */}
            <div>
              <label htmlFor="tax_number" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t('common:taxNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('tax_number')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.tax_number && <p className="mt-1 text-xs text-red-500">{errors.tax_number.message}</p>}
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
                : customer
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
