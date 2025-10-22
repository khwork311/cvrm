import Alert from '@/components/ui/alert/Alert';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { SectionLoading } from '@/components/ui/loading/SectionLoading';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useSidebar } from '@/context/SidebarContext';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { PencilIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Plan, PlanFilters } from './api/plans.api';
import { usePlans, useTogglePlanStatus } from './hooks/usePlans';
import { PageHeader } from './PageHeader';

export const Plans = () => {
  const { t, i18n } = useTranslation(['plans', 'common']);

  const { isExpanded } = useSidebar();
  const { error } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const filters: PlanFilters = {
    search: debouncedSearch || undefined,
    status: statusFilter ? +statusFilter : undefined,
    per_page: PAGE_LIMIT,
    page,
  };

  const { data, mutate, error: fetchingError, isLoading: fetchingLoading } = usePlans(filters);

  const { trigger, isMutating: togglingStatus, error: toggleError } = useTogglePlanStatus();

  // SERVER-SIDE PAGINATION DATA
  const plans = data?.data.data || [];
  const paginationData = data?.data;
  const total = paginationData?.total || 0;
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from || 0;
  const to = paginationData?.to || 0;

  const openConfirmModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedPlan) return;
    try {
      await trigger({ id: selectedPlan.id, status: selectedPlan.status === 1 ? 0 : 1 });
      mutate(); // refresh plans automatically
    } catch {
      error(toggleError?.message || "can't update plan status right now, please try again later ");
    } finally {
      closeModal();
    }
  };

  if (fetchingLoading) {
    return <SectionLoading size="lg" text="fetching plans..." />;
  }

  if (fetchingError) {
    return (
      <Alert variant="error" title={t('plans:errorFetchingPlans')} message={fetchingError.message} showLink={false} />
    );
  }

  // EMPTY STATE
  if (plans.length === 0) {
    return (
      <div>
        {/* Header + Filters */}
        <PageHeader
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Empty State */}
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white/90">{t('plans:noPlansFound')}</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {search || statusFilter ? t('plans:noPlansMatchFilters') : t('plans:noPlansCreated')}
            </p>
            <div className="flex justify-center">
              {search || statusFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setPage(1);
                  }}
                >
                  {t('common:resetFilters')}
                </Button>
              ) : (
                <Link to="/plans/create">
                  <Button variant="primary">{t('plans:createFirstPlan')}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header + Filters */}
      <PageHeader search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {/* Table for large screens */}
      <div
        className={`mt-8 hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-800 ${isExpanded ? 'lg:hidden xl:block' : ''} `}
      >
        <Table className="min-w-[900px]">
          <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-700/50">
            <TableRow>
              <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                {t('plans:titleColumn')}
              </TableCell>
              <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                {t('plans:descriptionColumn')}
              </TableCell>
              <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                {t('plans:usersLimit')}
              </TableCell>
              <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                {t('plans:customersLimit')}
              </TableCell>
              <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                {t('plans:vendorsLimit')}
              </TableCell>
              <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                {t('common:status')}
              </TableCell>
              <TableCell isHeader className="py-4 text-center font-semibold text-gray-900 dark:text-white/90">
                {t('common:actions')}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 text-center dark:divide-gray-700">
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="transition-colors duration-150 hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
              >
                <TableCell className="py-4">
                  <div className="font-semibold text-gray-900 dark:text-white/90">
                    {i18n.language === 'en' ? plan.title_en : plan.title_ar}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] py-4">
                  <div className="line-clamp-2 text-gray-700 dark:text-gray-300">
                    {i18n.language === 'en' ? plan.description_en : plan.description_ar}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {plan.users_limit}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {plan.customers_limit}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {plan.vendors_limit}
                  </span>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <div title={plan.status === 1 ? t('common:deactivate') : t('common:activate')}>
                    <Badge
                      variant="light"
                      color={plan.status === 1 ? 'success' : 'error'}
                      onClick={() => openConfirmModal(plan)}
                      startIcon={<PencilIcon className="" />}
                    >
                      {plan.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell className="px-2 text-center">
                  <Link
                    to={`/plans/update?id=${plan.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards for small screens */}
      <div className={`mt-6 grid grid-cols-1 gap-4 md:hidden ${isExpanded ? 'lg:grid xl:hidden' : ''}`}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{plan.title_en}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{plan.title_ar}</p>
              </div>

              <div title={plan.status === 1 ? t('common:deactivate') : t('common:activate')}>
                <Badge
                  variant="light"
                  color={plan.status === 1 ? 'success' : 'error'}
                  onClick={() => openConfirmModal(plan)}
                >
                  {plan.status === 1 ? t('common:active') : t('common:inactive')}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-gray-700 dark:text-gray-300">{plan.description_en}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description_ar}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('plans:usersLimit')}:</span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {plan.users_limit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('plans:customersLimit')}:
                </span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {plan.customers_limit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('plans:vendorsLimit')}:</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {plan.vendors_limit}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
              <Link
                to={`/plans/update?id=${plan.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4" />
                {t('common:edit')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
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
                className={`h-4 w-4 ${i18n.language === 'ar' ? 'rotate-180' : ''} `}
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
                className={`h-4 w-4 ${i18n.language === 'ar' ? 'rotate-180' : ''} `}
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

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              selectedPlan?.status === 1
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white/90">{t('plans:confirmToggle')}</h2>
        </div>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {selectedPlan?.status === 1
            ? t('plans:deactivateConfirm', {
                plan: i18n.language === 'en' ? selectedPlan?.title_en : selectedPlan?.title_ar,
              })
            : t('plans:activateConfirm', {
                plan: i18n.language === 'en' ? selectedPlan?.title_en : selectedPlan?.title_ar,
              })}
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal} className="min-w-[80px]">
            {t('common:cancel')}
          </Button>
          <Button disabled={togglingStatus} onClick={handleToggleStatus} className="min-w-[80px]">
            {t('common:confirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Plans;
