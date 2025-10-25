import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  isSearching: boolean;
  onCreate: () => void;
}

export const PageHeader = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  isSearching,
  onCreate,
}: PageHeaderProps) => {
  const { t } = useTranslation(['customerGroups', 'common']);

  return (
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white/90">
            {t('customerGroups:title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('customerGroups:subtitle')}</p>
        </div>
        <div title={t('customerGroups:createNew')}>
          <Button size="sm" variant="primary" onClick={onCreate} className="!block sm:!hidden">
            +
          </Button>
        </div>
      </div>
      <div className="flex flex-col flex-wrap justify-end gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <input
            type="text"
            placeholder={t('customerGroups:searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus:ring-brand-500/20 h-10 w-full rounded-lg border border-gray-300 bg-white px-4 pe-10 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:outline-none sm:w-64 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
          />
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
            {isSearching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>

        <Select
          options={statusOptions}
          value={statusFilter}
          placeholder={t('customerGroups:filterStatus')}
          onChange={(value) => setStatusFilter(value)}
          className="w-full sm:w-40 dark:bg-gray-800"
        />
        <div title={t('customerGroups:createNew')}>
          <Button size="sm" variant="primary" onClick={onCreate} className="!hidden sm:!block">
            +
          </Button>
        </div>
      </div>
    </div>
  );
};
