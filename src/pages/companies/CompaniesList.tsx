import CopyOnClick from '@/components/common/CopyOnClick';
import { EmptyState } from '@/components/common/EmptyState';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { TableActionsDropdown, type TableAction } from '@/components/ui/dropdown/TableActionsDropdown';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useActivateCompany, useCompanies, useToggleCompanyStatus } from './hooks/useCompanies';

interface Option {
  value: string;
  label: string;
}

type StatusFilter = 'all' | '1' | '0';

export const CompaniesList = () => {
  const { t, i18n } = useTranslation(['companies', 'common']);
  const toast = useToast();
  const isArabic = i18n.language === 'ar';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    companyId: number | null;
    action: 'activate' | 'deactivate' | null;
  }>({ isOpen: false, companyId: null, action: null });

  const debouncedSearch = useDebounce(search);

  const { data, isLoading, mutate } = useCompanies({
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: PAGE_LIMIT,
  });
  const companiesData = data?.data?.data;
  const paginationData = data?.data;
  const total = paginationData?.total || 0;
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from ?? 0;
  const to = paginationData?.to ?? 0;
  const { trigger: activateTrigger, isMutating: isActivating } = useActivateCompany();
  const { trigger: toggleTrigger, isMutating: isToggling } = useToggleCompanyStatus();
  const isActionLoading = isActivating || isToggling;

  const statusOptions: Option[] = [
    { value: 'all', label: t('common:all') },
    { value: '1', label: t('common:active') },
    { value: '0', label: t('common:notActive') },
  ];

  const handleActivateClick = (id: number, currentStatus: number) => {
    setConfirmModal({
      isOpen: true,
      companyId: id,
      action: currentStatus === 1 ? 'deactivate' : 'activate',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.companyId || !confirmModal.action) return;

    try {
      if (confirmModal.action === 'activate') {
        await activateTrigger(confirmModal.companyId);
        toast.success(t('companies:activateSuccess'));
      } else {
        await toggleTrigger(confirmModal.companyId);
        toast.success(t('companies:deactivateSuccess'));
      }
      // Refresh the data
      mutate();
    } catch (error) {
      const errorMessage =
        confirmModal.action === 'activate' ? t('companies:activateError') : t('companies:deactivateError');
      toast.error(errorMessage);
      console.error('Error toggling company status:', error);
    } finally {
      setConfirmModal({ isOpen: false, companyId: null, action: null });
    }
  };

  const handleCloseModal = () => {
    if (!isActionLoading) {
      setConfirmModal({ isOpen: false, companyId: null, action: null });
    }
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  return (
    <>
      <Helmet>
        <title>{t('companies:title', 'Companies')}</title>
      </Helmet>
      <div className="p-6">
        {/* Header + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
            {t('companies:title', 'Companies')}
          </h1>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={t('companies:searchPlaceholder', 'Search by name, VAT, or email...')}
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
              placeholder={t('companies:filterStatus', 'Filter by status')}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              className="dark:bg-dark-900"
            />

            <Link
              to="/companies/create"
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              + {t('companies:createNew', 'Create Company')}
            </Link>
          </div>
        </div>

        {/* Table for desktop */}
        <div className="mt-6 hidden overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 md:block dark:border-gray-700">
          <Table className="min-w-[1400px]">
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:nameColumn', 'Company Name')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:vatColumn', 'VAT Number')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:contactColumn', 'Contact')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:accountsColumn', 'Accounts')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:websiteColumn', 'Website')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:planColumn', 'Plan')}
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  {t('companies:subscriptionColumn', 'Subscription')}
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
                {companiesData?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {company.name_en}
                      </div>
                      <div className="text-theme-xs text-gray-500 dark:text-gray-400">{company.name_ar}</div>
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                      <CopyOnClick textToCopy={company.vat_number}>
                        <span className="font-mono">{company.vat_number}</span>
                      </CopyOnClick>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-start">
                      <div className="text-theme-xs space-y-0.5">
                        {company.email && <div className="text-gray-600 dark:text-gray-400">📧 {company.email}</div>}
                        {company.telephone_number && (
                          <div className="text-gray-600 dark:text-gray-400">📞 {company.telephone_number}</div>
                        )}
                        {company.mobile_number && (
                          <div className="text-gray-600 dark:text-gray-400">📱 {company.mobile_number}</div>
                        )}
                        {!company.email && !company.telephone_number && !company.mobile_number && '-'}
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-start">
                      <div className="text-theme-xs space-y-0.5">
                        {company.main_account_number && (
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-bold">Main:</span>
                            <CopyOnClick textToCopy={company.vat_number}>
                              <span className="font-mono">{company.main_account_number}</span>
                            </CopyOnClick>
                          </div>
                        )}
                        {company.sub_account_number && (
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-bold">Sub:</span>
                            <CopyOnClick textToCopy={company.vat_number}>
                              <span className="font-mono">{company.sub_account_number}</span>
                            </CopyOnClick>
                          </div>
                        )}
                        {!company.main_account_number && !company.sub_account_number && '-'}
                      </div>
                    </TableCell>

                    <TableCell className="text-theme-sm max-w-32 px-5 py-4 text-gray-600 dark:text-gray-400">
                      {company.website_url ? (
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-blue-600 hover:underline"
                        >
                          {company.website_url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                      {isArabic ? company?.plan?.title_ar : company?.plan?.title_en}
                    </TableCell>

                    <TableCell className="text-theme-xs px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                      {company.subscription_start_date && company.subscription_end_date ? (
                        <div>
                          <div>{company.subscription_start_date}</div>
                          <div className="text-gray-500">to {company.subscription_end_date}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-4 text-center">
                      <button
                        onClick={() => handleActivateClick(company.id, company.status)}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        title={company.status ? t('common:deactivate') : t('companies:activateCompany')}
                      >
                        <Badge variant="light" color={company.status ? 'success' : 'error'}>
                          {company.status ? t('common:active') : t('common:inactive')}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-center">
                      <TableActionsDropdown
                        actions={
                          [
                            {
                              label: t('common:edit'),
                              to: `/companies/${company.id}/edit`,
                              icon: <PencilIcon className="h-4 w-4" />,
                              variant: 'primary',
                            },
                            {
                              label: t('companies:contacts', 'Contacts'),
                              to: `/companies/${company.id}/contacts`,
                            },
                            {
                              label: t('companies:bankAccounts', 'Bank Accounts'),
                              to: `/companies/${company.id}/bank-accounts`,
                            },
                            {
                              label: t('companies:addresses', 'Addresses'),
                              to: `/companies/${company.id}/addresses`,
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
          {companiesData?.map((company) => (
            <div
              key={company.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{company.name_en}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{company.name_ar}</p>
                </div>
                <button
                  onClick={() => handleActivateClick(company.id, company.status)}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  title={company.status ? t('common:deactivate') : t('companies:activateCompany')}
                >
                  <Badge variant="light" color={company.status ? 'success' : 'error'}>
                    {company.status ? t('common:active') : t('common:inactive')}
                  </Badge>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('companies:vatColumn')}:</span>
                  <span className="font-mono text-gray-600 dark:text-gray-400">{company.vat_number}</span>
                </div>
                {company.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">📧</span>
                    <span className="text-gray-600 dark:text-gray-400">{company.email}</span>
                  </div>
                )}
                {company.telephone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">📞</span>
                    <span className="text-gray-600 dark:text-gray-400">{company.telephone_number}</span>
                  </div>
                )}
                {company.plan && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('companies:planColumn')}:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {isArabic ? company.plan.title_ar : company.plan.title_en}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                <Link
                  to={`/companies/${company.id}/edit`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4" />
                  {t('common:edit')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {companiesData?.length === 0 && (
          <EmptyState
            title={t('companies:noCompaniesFound', 'No companies found')}
            description={t('companies:noCompaniesDescription', 'Get started by creating your first company')}
          />
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
                <svg
                  className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                <svg
                  className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
            ? t('companies:activateConfirmTitle')
            : t('companies:deactivateConfirmTitle')
        }
        message={
          confirmModal.action === 'activate'
            ? t('companies:activateConfirmMessage')
            : t('companies:deactivateConfirmMessage')
        }
        confirmText={confirmModal.action === 'activate' ? t('common:activate') : t('common:deactivate')}
        cancelText={t('common:cancel')}
        variant={confirmModal.action === 'activate' ? 'success' : 'danger'}
        isLoading={isActionLoading}
      />
    </>
  );
};
