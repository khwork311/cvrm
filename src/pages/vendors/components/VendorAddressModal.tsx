import { Modal } from '@/components/ui/modal';
import { useCities, useCountries } from '@/pages/companies/hooks/useAddresses';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateVendorAddress, useUpdateVendorAddress, useVendorAddress } from '../hooks';
import { vendorAddressSchema, type VendorAddressFormData } from '../schemas';

interface VendorAddressModalProps {
  vendorId: number;
  addressId: number | null;
  onClose: () => void;
}

export const VendorAddressModal = ({ vendorId, addressId, onClose }: VendorAddressModalProps) => {
  const { t } = useTranslation(['vendors', 'common', 'validation']);
  const isEditMode = !!addressId;

  const { data: addressData, isLoading: isLoadingAddress } = useVendorAddress(addressId);
  const { data: countries } = useCountries();
  const { trigger: createAddress, isMutating: isCreating } = useCreateVendorAddress(vendorId);
  const { trigger: updateAddress, isMutating: isUpdating } = useUpdateVendorAddress(vendorId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<VendorAddressFormData>({
    resolver: zodResolver(vendorAddressSchema),
    defaultValues: {
      address_type: 'billing',
      is_default: false,
      country_id: 0,
      city_id: 0,
      address_name: '',
      street_name: '',
      building_number: '',
      postal_code: '',
      status: 1,
    },
  });

  const selectedCountryId = watch('country_id');
  const { data: cities } = useCities(selectedCountryId || null);

  useEffect(() => {
    if (addressData && isEditMode) {
      reset({
        address_type: addressData.data.address_type,
        is_default: addressData.data.is_default,
        country_id: addressData.data.country_id,
        city_id: addressData.data.city_id,
        address_name: addressData.data.address_name,
        street_name: addressData.data.street_name,
        building_number: addressData.data.building_number || '',
        postal_code: addressData.data.postal_code || '',
        status: addressData.data.status,
      });
    }
  }, [addressData, isEditMode, reset]);

  const onSubmit = async (data: VendorAddressFormData) => {
    try {
      if (isEditMode && addressId) {
        await updateAddress({ id: addressId, data });
      } else {
        await createAddress(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditMode ? t('vendors:editAddress') : t('vendors:addAddress')}
        </h2>

        {isLoadingAddress ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:addressType')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('address_type')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                >
                  <option value="billing">{t('vendors:addressType_billing')}</option>
                  <option value="shipping">{t('vendors:addressType_shipping')}</option>
                  <option value="other">{t('vendors:addressType_other')}</option>
                </select>
                {errors.address_type && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.address_type.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:country')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('country_id', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                >
                  <option value="">{t('vendors:selectCountry')}</option>
                  {countries?.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name_en}
                    </option>
                  ))}
                </select>
                {errors.country_id && <p className="mt-1 text-sm text-red-500">{t(errors.country_id.message || '')}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:city')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('city_id', { valueAsNumber: true })}
                  disabled={!selectedCountryId}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:text-white/90"
                >
                  <option value="">{t('vendors:selectCity')}</option>
                  {cities?.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name_en}
                    </option>
                  ))}
                </select>
                {errors.city_id && <p className="mt-1 text-sm text-red-500">{t(errors.city_id.message || '')}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:addressName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('address_name')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.address_name && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.address_name.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:streetName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('street_name')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
                {errors.street_name && (
                  <p className="mt-1 text-sm text-red-500">{t(errors.street_name.message || '')}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:buildingNumber')}
                </label>
                <input
                  type="text"
                  {...register('building_number')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vendors:postalCode')}
                </label>
                <input
                  type="text"
                  {...register('postal_code')}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:text-white/90"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  {...register('is_default')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <label htmlFor="is_default" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('vendors:setAsDefault')}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('common:cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? t('common:saving') : t('common:save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
