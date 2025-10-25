import { EmptyState } from '@/components/common/EmptyState';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import { ConfirmationModal } from '@/components/ui/modal/ConfirmationModal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/context/ToastContext.tsx';
import { useDebounce } from '@/hooks/useDebounce.ts';
import { PencilIcon } from '@/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import type { ContactPerson } from './api/companies.api';
import { useContacts, useCreateContact, useToggleContactStatus, useUpdateContact } from './hooks/useContacts';
import { getContactPersonSchema, type ContactPersonFormData } from './schemas.ts';

export const ContactPersons = () => {
  const { t } = useTranslation(['customers', 'common']);
  const { companyId } = useParams<{ companyId: string }>();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    contactId: number | null;
    action: 'activate' | 'deactivate' | null;
  }>({ isOpen: false, contactId: null, action: null });

  const debouncedSearch = useDebounce(search);

  // Fetch contacts using SWR
  const { data, isLoading, mutate } = useContacts({
    company_id: Number(companyId),
    search: debouncedSearch ? debouncedSearch : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { trigger: toggleTrigger } = useToggleContactStatus();

  const contacts = data?.data?.data || [];

  const statusOptions = [
    { value: 'all', label: t('common:all') },
    { value: '1', label: t('common:active') },
    { value: '0', label: t('common:notActive') },
  ];

  const handleConfirmStatusChange = async () => {
    if (!confirmModal.contactId) return;

    try {
      await toggleTrigger(confirmModal.contactId);
      mutate();
      toast.success(
        confirmModal.action === 'activate'
          ? t('contacts:activateSuccess', 'Contact activated successfully')
          : t('contacts:deactivateSuccess', 'Contact deactivated successfully')
      );
    } catch (error) {
      console.error('Error toggling contact status:', error);
      toast.error(
        confirmModal.action === 'activate'
          ? t('contacts:activateError', 'Failed to activate contact')
          : t('contacts:deactivateError', 'Failed to deactivate contact')
      );
    } finally {
      setConfirmModal({ isOpen: false, contactId: null, action: null });
    }
  };

  const handleEdit = (contact: ContactPerson) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setShowModal(true);
  };

  // Check if search is being debounced (user is typing)
  const isSearching = search !== debouncedSearch;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header + Filters */}
      <div className="mb-4 flex items-center gap-2">
        <Link to="/companies" className="text-blue-500 hover:underline">
          Companies
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700 dark:text-gray-300">Contact Persons</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
          {t('contacts:title', 'Contact Persons')}
        </h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder={t('contacts:searchPlaceholder', 'Search by name or email...')}
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
            placeholder={t('contacts:filterStatus', 'Filter by status')}
            onChange={(value) => setStatusFilter(value)}
            className="dark:bg-dark-900"
          />

          <button
            onClick={handleCreate}
            className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + {t('contacts:createNew', 'Add Contact')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 dark:border-gray-700">
        <Table className="min-w-[900px]">
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('contacts:nameColumn', 'Name')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('contacts:emailColumn', 'Email')}
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                {t('contacts:positionColumn', 'Position')}
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

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="px-5 py-4 text-start">
                  <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {contact.first_name_en} {contact.last_name_en}
                  </div>
                  <div className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {contact.first_name_ar} {contact.last_name_ar}
                  </div>
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                  {contact.email}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-gray-600 dark:text-gray-400">
                  {contact.position || '-'}
                </TableCell>

                <TableCell className="text-theme-sm px-5 py-4 text-center">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        contactId: contact.id,
                        action: contact.status === 1 ? 'deactivate' : 'activate',
                      })
                    }
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    title={contact.status === 1 ? t('common:deactivate') : t('common:activate')}
                  >
                    <Badge variant="light" color={contact.status === 1 ? 'success' : 'error'}>
                      {contact.status === 1 ? t('common:active') : t('common:inactive')}
                    </Badge>
                  </button>
                </TableCell>

                <TableCell className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleEdit(contact)}
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

      {contacts.length === 0 && (
        <EmptyState
          title={t('contacts:noContactsFound', 'No contacts found')}
          description={t('contacts:addFirstContact', 'Add your first contact person')}
        />
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          companyId={Number(companyId)}
          onClose={() => setShowModal(false)}
          onSave={() => {
            mutate();
            setShowModal(false);
            setEditingContact(null);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, contactId: null, action: null })}
        onConfirm={handleConfirmStatusChange}
        title={
          confirmModal.action === 'activate'
            ? t('contacts:activateConfirmTitle', 'Activate Contact')
            : t('contacts:deactivateConfirmTitle', 'Deactivate Contact')
        }
        message={
          confirmModal.action === 'activate'
            ? t('contacts:activateConfirmMessage', 'Are you sure you want to activate this contact?')
            : t('contacts:deactivateConfirmMessage', 'Are you sure you want to deactivate this contact?')
        }
        confirmText={confirmModal.action === 'activate' ? t('common:activate') : t('common:deactivate')}
        cancelText={t('common:cancel')}
        variant={confirmModal.action === 'activate' ? 'success' : 'danger'}
      />
    </div>
  );
};

// Contact Modal Component
interface ContactModalProps {
  contact: ContactPerson | null;
  companyId: number;
  onClose: () => void;
  onSave: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ contact, companyId, onClose, onSave }) => {
  const { t } = useTranslation(['contacts', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trigger: createTrigger } = useCreateContact(companyId);
  const { trigger: updateTrigger } = useUpdateContact();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactPersonFormData>({
    resolver: zodResolver(getContactPersonSchema()),
    defaultValues: {
      first_name_en: contact?.first_name_en || '',
      first_name_ar: contact?.first_name_ar || '',
      last_name_en: contact?.last_name_en || '',
      last_name_ar: contact?.last_name_ar || '',
      email: contact?.email || '',
      position: contact?.position || '',
    },
  });

  const onSubmit = async (data: ContactPersonFormData) => {
    try {
      setIsSubmitting(true);

      if (contact) {
        // Update existing contact
        await updateTrigger({ id: contact.id, data });
      } else {
        // Create new contact
        await createTrigger(data);
      }

      onSave();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {contact ? t('contacts:editContact', 'Edit Contact') : t('contacts:addContact', 'Add Contact')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name EN */}
            <div>
              <label
                htmlFor="first_name_en"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                First Name (EN) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('first_name_en')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.first_name_en && <p className="mt-1 text-xs text-red-500">{errors.first_name_en.message}</p>}
            </div>

            {/* First Name AR */}
            <div>
              <label
                htmlFor="first_name_ar"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                First Name (AR) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('first_name_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.first_name_ar && <p className="mt-1 text-xs text-red-500">{errors.first_name_ar.message}</p>}
            </div>

            {/* Last Name EN */}
            <div>
              <label
                htmlFor="last_name_en"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Last Name (EN) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('last_name_en')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.last_name_en && <p className="mt-1 text-xs text-red-500">{errors.last_name_en.message}</p>}
            </div>

            {/* Last Name AR */}
            <div>
              <label
                htmlFor="last_name_ar"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Last Name (AR) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('last_name_ar')}
                type="text"
                dir="rtl"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.last_name_ar && <p className="mt-1 text-xs text-red-500">{errors.last_name_ar.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Position
              </label>
              <input
                {...register('position')}
                type="text"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
                : contact
                  ? t('common:update', 'Update')
                  : t('common:create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPersons;
