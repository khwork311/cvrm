/**
 * Companies API Exports
 * 
 * Centralized export for all companies-related API calls
 */

export {
  companiesApi,
  contactsApi,
  bankAccountsApi,
  addressesApi,
  countriesApi,
  companiesApiService as default,
  type Company,
  type CompanyFilters,
  type ContactPerson,
  type ContactFilters,
  type BankAccount,
  type BankAccountFilters,
  type Address,
  type AddressFilters,
  type Country,
  type City,
} from './companies.api';
