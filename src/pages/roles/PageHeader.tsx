import { Select } from '@/components/form';
import Button from '@/components/ui/button/Button';
import { getStatusOptions } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

const PageHeader = ({ search, setSearch, statusFilter, setStatusFilter }: PageHeaderProps) => {
  const { t } = useTranslation('roles');

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-3xl dark:text-white/90">{t('roles:title')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('roles:subtitle', 'Manage user roles and permissions')}
          </p>
        </div>
        <Link to="/roles/create" title={t('roles:createNewRole')}>
          <Button size="sm" variant="primary" className="!block sm:!hidden">
            +
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center md:gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder={t('roles:searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus:ring-brand-500/20 h-10 w-full rounded-lg border border-gray-300 bg-white px-1 pe-10 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:outline-none sm:w-64 md:px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
          />
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <Select
          options={getStatusOptions(t)}
          defaultValue={statusFilter === '' ? getStatusOptions(t)[0].label : statusFilter}
          placeholder={t('plans:filterStatus')}
          onChange={(value) => setStatusFilter(value)}
          className="w-full sm:w-40 dark:bg-gray-800"
        />

        <Link to="/roles/create" title={t('roles:createNewRole')}>
          <Button size="sm" variant="primary" className="!hidden sm:!block">
            +
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;
