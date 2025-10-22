/**
 * Addresses SWR Hooks
 * 
 * Custom hooks for data fetching using SWR
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { addressesApi, countriesApi, type AddressFilters, type Country, type City } from '../api/companies.api';
import type { AddressFormData } from '../schemas';

/**
 * Hook to fetch all addresses for a company
 */
export function useAddresses(companyId: number | null, filters?: AddressFilters) {
  const key = companyId ? ['addresses', companyId, filters] : null;
  
  return useSWR(
    key,
    () => addressesApi.getAll(companyId!, filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );
}

/**
 * Hook to fetch a single address by ID
 */
export function useAddress(id: number | null) {
  return useSWR(
    id ? ['address', id] : null,
    () => addressesApi.getById(id!),
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to create a new address
 */
export function useCreateAddress(companyId: number) {
  return useSWRMutation(
    ['addresses', companyId],
    async (_key, { arg }: { arg: AddressFormData }) => {
      // Convert string IDs to numbers for API
      const addressData = {
        ...arg,
        city_id: Number(arg.city_id),
        country_id: Number(arg.country_id),
      };
      return addressesApi.create(companyId, addressData);
    }
  );
}

/**
 * Hook to update an address
 */
export function useUpdateAddress() {
  return useSWRMutation(
    'addresses',
    async (_key, { arg }: { arg: { id: number; data: AddressFormData } }) => {
      // Convert string IDs to numbers for API
      const addressData = {
        ...arg.data,
        city_id: Number(arg.data.city_id),
        country_id: Number(arg.data.country_id),
      };
      return addressesApi.update(arg.id, addressData);
    }
  );
}

/**
 * Hook to toggle address status
 */
export function useToggleAddressStatus() {
  return useSWRMutation(
    'addresses',
    async (_key, { arg }: { arg: number }) => {
      return addressesApi.toggleStatus(arg);
    }
  );
}

/**
 * Hook to fetch all countries
 */
export function useCountries() {
  return useSWR<Country[]>(
    'countries',
    () => countriesApi.getAll(),
    {
      revalidateOnFocus: false,
    }
  );
}

/**
 * Hook to fetch cities by country
 */
export function useCities(countryId: number | null) {
  return useSWR<City[]>(
    countryId ? ['cities', countryId] : null,
    () => countriesApi.getCities(countryId!),
    {
      revalidateOnFocus: false,
    }
  );
}
