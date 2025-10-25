import Alert from '@/components/ui/alert/Alert';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { SectionLoading } from '@/components/ui/loading/SectionLoading';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useSidebar } from '@/context/SidebarContext';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { EyeIcon, MailIcon, PencilIcon, UserIcon } from '@/icons';
import { PAGE_LIMIT } from '@/lib/constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, UserFilters } from './api';
import { useToggleUserStatus, useUsers } from './hooks/useUsers';
import { PageHeader } from './PageHeader';

export const Users = () => {
  const { t, i18n } = useTranslation(['users', 'common']);
  const { isExpanded } = useSidebar();
  const { success, error: showError } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const filters: UserFilters = {
    search: debouncedSearch || undefined,
    status: statusFilter ? +statusFilter : undefined,
    role_id: roleFilter ? parseInt(roleFilter) : undefined,
    per_page: PAGE_LIMIT,
    page,
  };

  const { data, mutate, isLoading, error } = useUsers(filters);
  const { trigger: toggleStatus, isMutating: togglingStatus } = useToggleUserStatus();

  // SERVER-SIDE PAGINATION DATA
  const users = data?.data.data || [];
  const paginationData = data?.data;
  const total = paginationData?.total || 0;
  const currentPage = paginationData?.current_page || 1;
  const totalPages = paginationData?.last_page || 1;
  const from = paginationData?.from || 0;
  const to = paginationData?.to || 0;

  const openConfirmModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      await toggleStatus({ id: selectedUser.id, status: selectedUser.status ? 0 : 1 });
      mutate();
      success(t('users:statusUpdated'));
      closeModal();
    } catch (err) {
      showError(t('users:statusUpdateError'));
    }
  };

  if (isLoading) {
    return <SectionLoading size="lg" text={t('users:loading')} />;
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title={t('plans:errorFetchingPlans')}
        message={error.response.data.message}
        showLink={false}
      />
    );
  }

  // EMPTY STATE
  if (users.length === 0) {
    return (
      <div>
        <PageHeader
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
        />

        {/* Empty State */}
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <UserIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white/90">{t('users:noUsersFound')}</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {search || statusFilter || roleFilter ? t('users:noUsersMatchFilters') : t('users:noUsersCreated')}
            </p>
            <div className="flex justify-center">
              {search || statusFilter || roleFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setRoleFilter('');
                    setPage(1);
                  }}
                >
                  {t('users:resetFilters')}
                </Button>
              ) : (
                <Link to="/users/create">
                  <Button variant="primary">{t('users:createFirstUser')}</Button>
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
      <PageHeader
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {/* Table for large screens */}
      <div
        className={`mt-8 hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-800 ${isExpanded ? 'lg:hidden xl:block' : ''} `}
      >
        <Table className="min-w-[900px]">
          <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-700/50">
            <TableRow>
              <TableCell isHeader className="py-4 ps-16 text-start font-semibold text-gray-900 dark:text-white/90">
                {t('users:user')}
              </TableCell>
              <TableCell isHeader className="py-4 font-semibold text-gray-900 dark:text-white/90">
                {t('users:role')}
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
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="transition-colors duration-150 hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3 ps-12">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white/90">{user.name}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <MailIcon className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-center gap-2">
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{user.role.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <Badge
                    variant="light"
                    color={user.status === 1 ? 'success' : 'error'}
                    onClick={() => openConfirmModal(user)}
                  >
                    {user.status === 1 ? t('common:active') : t('common:notActive')}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/users/update?id=${user.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards for small screens */}
      <div className={`mt-6 grid grid-cols-1 gap-4 md:hidden ${isExpanded ? 'lg:grid xl:hidden' : ''}`}>
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">{user.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <Badge
                variant="light"
                color={user.status === 1 ? 'success' : 'error'}
                onClick={() => openConfirmModal(user)}
              >
                {user.status === 1 ? t('common:active') : t('common:notActive')}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{user.role.name}</span>
            </div>

            <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
              <Link
                to={`/users/update?id=${user.id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
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
              selectedUser?.status === 1
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white/90">{t('users:confirmToggle')}</h2>
        </div>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {selectedUser?.status === 1 ? t('users:deactivateConfirm') : t('users:activateConfirm')}
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

export default Users;
