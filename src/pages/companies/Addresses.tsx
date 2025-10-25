import { EmptyState } from '@/components/common/EmptyState';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon } from '@/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import type { Address } from './api/companies.api';
import {
  useAddresses,
  useCities,
  useCountries,
  useCreateAddress,
  useToggleAddressStatus,
  useUpdateAddress,
} from './hooks/useAddresses';
import { getAddressSchema, type AddressFormData } from './schemas';

interface Option {
  value: string;
  label: string;
}

type StatusFilter = 'all' | '1' | '0';

export const Addresses = () => {
  const { t } = useTranslation(['addresses', 'common']);
  const { companyId } = useParams<{ companyId: string }>();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    addressId: number | null;
    action: 'activate' | 'deactivate' | null;
  }>({ isOpen: false, addressId: null, action: null });

  const debouncedSearch = useDebounce(search);

  // Fetch addresses using SWR
  const { data, isLoading, mutate } = useAddresses(companyId ? Number(companyId) : null, {
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { trigger: toggleTrigger } = useToggleAddressStatus();

  const addresses = data?.data?.data || [];

  const statusOptions: Option[] = [
    { value: 'all', label: t('common:all') },
    { value: '1', label: t('common:active') },
    { value: '0', label: t('common:notActive') },
  ];

  const handleConfirmStatusChange = async () => {
    if (!confirmModal.addressId) return;

    try {
      await toggleTrigger(confirmModal.addressId);
      mutate();
      toast.success(
        confirmModal.action === 'activate'
          ? t('addresses:activateSuccess', 'Address activated successfully')
          : t('addresses:deactivateSuccess', 'Address deactivated successfully')
      );
    } catch (error) {
      console.error('Error toggling address status:', error);
      toast.error(
        confirmModal.action === 'activate'
          ? t('addresses:activateError', 'Failed to activate address')
          : t('addresses:deactivateError', 'Failed to deactivate address')
      );
    } finally {
      setConfirmModal({ isOpen: false, addressId: null, action: null });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2">
        <Link to="/companies" className="text-blue-500 hover:underline">
          Companies
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">Addresses</span>
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{t('addresses:title', 'Addresses')}</h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder={t('addresses:searchPlaceholder', 'Search by name, street, or city...')}
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
            placeholder={t('addresses:filterStatus', 'Filter by status')}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            className="dark:bg-dark-900"
          />

          <button
            onClick={handleCreate}
            className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + {t('addresses:createNew', 'Add Address')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 dark:border-gray-700">
        <Table className="min-w-[1000px]">
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('addresses:addressNameColumn', 'Address Name')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('addresses:countryColumn', 'Country')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('addresses:cityColumn', 'City')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('addresses:streetColumn', 'Street')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
              >
                {t('addresses:postalCodeColumn', 'Postal Code')}
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

          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex h-96 items-center justify-center">
                  <div className="text-gray-500 dark:text-gray-400">Loading addresses...</div>
                </div>
              </TableCell>
            </TableRow>
          )}
          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {addresses.map((address) => (
              <TableRow key={address.id}>
                <TableCell className="text-theme-sm px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                  {address.address_name}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                  {address.country?.name_en || '-'}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                  {address.city?.name_en || '-'}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                  {address.street_name}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                  {address.postal_code || '-'}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-center">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        addressId: address.id,
                        action: address.status === 1 ? 'deactivate' : 'activate',
                      })
                    }
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    title={address.status === 1 ? t('common:deactivate') : t('common:activate')}
                  >
                    <Badge variant="light" color={address.status === 1 ? 'success' : 'error'}>
                      {address.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </button>
                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleEdit(address)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    title={t('common:edit')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {addresses.length === 0 && (
        <EmptyState
          title={t('addresses:noAddressesFound', 'No addresses found')}
          description={t('addresses:addFirstAddress', 'Add your first address to get started')}
        />
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <AddressModal
          address={editingAddress}
          companyId={Number(companyId)}
          onClose={() => setShowModal(false)}
          onSave={() => {
            mutate();
            setShowModal(false);
            setEditingAddress(null);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, addressId: null, action: null })}
        onConfirm={handleConfirmStatusChange}
        title={
          confirmModal.action === 'activate'
            ? t('addresses:activateConfirmTitle', 'Activate Address')
            : t('addresses:deactivateConfirmTitle', 'Deactivate Address')
        }
        message={
          confirmModal.action === 'activate'
            ? t('addresses:activateConfirmMessage', 'Are you sure you want to activate this address?')
            : t('addresses:deactivateConfirmMessage', 'Are you sure you want to deactivate this address?')
        }
        confirmText={confirmModal.action === 'activate' ? t('common:activate') : t('common:deactivate')}
        cancelText={t('common:cancel')}
        variant={confirmModal.action === 'activate' ? 'success' : 'danger'}
      />
    </div>
  );
};

// Address Modal Component
interface AddressModalProps {
  address: Address | null;
  companyId: number;
  onClose: () => void;
  onSave: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ address, companyId, onClose, onSave }) => {
  const { t, i18n } = useTranslation(['addresses', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string>(address?.country_id?.toString() || '');

  const { trigger: createTrigger } = useCreateAddress(companyId);
  const { trigger: updateTrigger } = useUpdateAddress();
  const { data: countriesData } = useCountries();
  const { data: citiesData } = useCities(selectedCountryId ? Number(selectedCountryId) : null);

  const countries =
    countriesData?.map((c) => ({ value: c.id.toString(), label: i18n.language === 'ar' ? c.name_ar! : c.name_en! })) ||
    [];
  const cities =
    citiesData?.map((c) => ({ value: c.id.toString(), label: i18n.language === 'ar' ? c.name_ar! : c.name_en! })) || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(getAddressSchema()),
    defaultValues: {
      country_id: address?.country_id?.toString() || '',
      city_id: address?.city_id?.toString() || '',
      address_name: address?.address_name || '',
      street_name: address?.street_name || '',
      building_number: address?.building_number || '',
      postal_code: address?.postal_code || '',
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);

      if (address) {
        await updateTrigger({ id: address.id, data });
      } else {
        await createTrigger(data);
      }

      onSave();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {address ? t('addresses:editAddress', 'Edit Address') : t('addresses:addAddress', 'Add Address')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Country */}
            <div>
              <label htmlFor="country_id" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Country <span className="text-red-500">*</span>
              </label>
              <Controller
                name="country_id"
                control={control}
                disabled={countries.length === 0}
                render={({ field }) => (
                  <Select
                    options={countries}
                    defaultValue={field.value}
                    placeholder="Select country"
                    onChange={(value) => {
                      field.onChange(value);
                      setSelectedCountryId(value);
                      setValue('city_id', '');
                    }}
                  />
                )}
              />
              {errors.country_id && <p className="mt-1 text-xs text-red-500">{errors.country_id.message}</p>}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city_id" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                City <span className="text-red-500">*</span>
              </label>
              {selectedCountryId ? (
                <Controller
                  name="city_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={cities}
                      defaultValue={field.value}
                      placeholder="Select city"
                      onChange={field.onChange}
                    />
                  )}
                />
              ) : (
                <div className="shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                  Select a country first
                </div>
              )}
              {errors.city_id && <p className="mt-1 text-xs text-red-500">{errors.city_id.message}</p>}
            </div>

            {/* Address Name */}
            <div>
              <label
                htmlFor="address_name"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Address Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('address_name')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="e.g., Headquarters, Warehouse #1"
              />
              {errors.address_name && <p className="mt-1 text-xs text-red-500">{errors.address_name.message}</p>}
            </div>

            {/* Street Name */}
            <div>
              <label
                htmlFor="street_name"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Street Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('street_name')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Street name"
              />
              {errors.street_name && <p className="mt-1 text-xs text-red-500">{errors.street_name.message}</p>}
            </div>

            {/* Postal Code */}
            <div className="md:col-span-2">
              <label
                htmlFor="postal_code"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Postal Code
              </label>
              <input
                {...register('postal_code')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="12345"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t('common:saving', 'Saving...')
                : address
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addresses;
