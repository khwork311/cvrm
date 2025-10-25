/**
 * Companies API Exports
 *
 * Centralized export for all companies-related API calls
 */

export {
  addressesApi,
  bankAccountsApi,
  companiesApi,
  contactsApi,
  countriesApi,
  companiesApiService as default,
  type Address,
  type AddressFilters,
  type BankAccount,
  type BankAccountFilters,
  type City,
  type Company,
  type CompanyFilters,
  type ContactFilters,
  type ContactPerson,
  type Country,
} from './companies.api';
