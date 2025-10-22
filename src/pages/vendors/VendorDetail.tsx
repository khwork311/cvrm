import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { VendorAddressesTab } from './components/VendorAddressesTab';
import { VendorBankAccountsTab } from './components/VendorBankAccountsTab';
import { VendorTabs } from './components/VendorTabs';
import { VendorUserAccessTab } from './components/VendorUserAccessTab';
import { useVendor } from './hooks';

export const VendorDetail = () => {
  const { t, ready } = useTranslation(['vendors', 'common']);
  const { vendorId } = useParams<{ vendorId: string }>();

  const { data: vendorResponse, isLoading } = useVendor(vendorId ? parseInt(vendorId) : null);
  
  // Extract vendor data from API response
  const vendor = vendorResponse?.data;

  if (!ready || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('common:loading')}</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t('vendors:vendorNotFound')}</div>
      </div>
    );
  }

  const getInvitationStatus = () => {
    if (vendor.user_id) {
      return { label: t('vendors:accepted'), color: 'success' as const };
    }
    if (vendor.invitation_token && vendor.invitation_expires_at) {
      const expiresAt = new Date(vendor.invitation_expires_at);
      if (expiresAt > new Date()) {
        return { label: t('vendors:pending'), color: 'warning' as const };
      }
      return { label: t('vendors:expired'), color: 'error' as const };
    }
    return { label: t('vendors:notInvited'), color: 'light' as const };
  };

  const invitationStatus = getInvitationStatus();

  const tabs = [
    {
      id: 'overview',
      label: t('vendors:overview'),
      content: (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:basicInfo')}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendors:nameEn')}</label>
                <p className="mt-1 text-gray-800 dark:text-white/90">{vendor.name_en}</p>
              </div>
              {vendor.name_ar && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendors:nameAr')}</label>
                  <p className="mt-1 text-gray-800 dark:text-white/90" dir="rtl">
                    {vendor.name_ar}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendors:email')}</label>
                <p className="mt-1 text-gray-800 dark:text-white/90">{vendor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:phoneNumber')}
                </label>
                <p className="mt-1 text-gray-800 dark:text-white/90">{vendor.phone_number}</p>
              </div>
              {vendor.tax_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('vendors:taxNumber')}
                  </label>
                  <p className="mt-1 text-gray-800 dark:text-white/90">{vendor.tax_number}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common:status')}</label>
                <div className="mt-1">
                  <Badge variant="light" color={vendor.status === 1 ? 'success' : 'error'}>
                    {vendor.status === 1 ? t('common:active') : t('common:inactive')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
              {t('vendors:invitationInfo')}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vendors:invitationStatus')}
                </label>
                <div className="mt-1">
                  <Badge variant="light" color={invitationStatus.color}>
                    {invitationStatus.label}
                  </Badge>
                </div>
              </div>
              {vendor.invited_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('vendors:invitedAt')}
                  </label>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {new Date(vendor.invited_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {vendor.invitation_expires_at && !vendor.user_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('vendors:expiresAt')}
                  </label>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {new Date(vendor.invitation_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {!vendor.user_id && (
              <div className="mt-4">
                <Link
                  to={`/vendors/${vendor.id}/invite`}
                  className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  {vendor.invitation_token ? t('vendors:resendInvitation') : t('vendors:sendInvitation')}
                </Link>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'addresses',
      label: t('vendors:addresses'),
      content: <VendorAddressesTab vendorId={vendor.id} />,
    },
    {
      id: 'bankAccounts',
      label: t('vendors:bankAccounts'),
      content: <VendorBankAccountsTab vendorId={vendor.id} />,
    },
    {
      id: 'userAccess',
      label: t('vendors:userAccess'),
      content: <VendorUserAccessTab vendor={vendor} />,
    },
  ];

  return (
    <>
      <PageMeta
        title={ready ? `${vendor.name_en} - ${t('vendors:title')}` : 'Vendor Details'}
        description={ready ? t('vendors:detailDescription') : 'View vendor details'}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">{vendor.name_en}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{vendor.email}</p>
          </div>
          <Link
            to={`/vendors/${vendor.id}/edit`}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            {t('common:edit')}
          </Link>
        </div>

        {/* Tabs */}
        <VendorTabs tabs={tabs} defaultTab="overview" />
      </div>
    </>
  );
};
