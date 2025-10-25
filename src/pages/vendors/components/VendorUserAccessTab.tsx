import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Vendor } from '../api/vendors.api';

interface VendorUserAccessTabProps {
  vendor: Vendor;
}

export const VendorUserAccessTab = ({ vendor }: VendorUserAccessTabProps) => {
  const { t } = useTranslation(['vendors', 'common']);

  return (
    <div className="space-y-6">
      {vendor.user_id ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:linkedUser')}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendors:userStatus')}</label>
              <div className="mt-1">
                <Badge variant="light" color="success">
                  {t('vendors:userLinked')}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendors:userId')}</label>
              <p className="mt-1 text-gray-800 dark:text-white/90">{vendor.user_id}</p>
            </div>
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vendors:userAccessDescription')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">{t('vendors:noUserLinked')}</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">{t('vendors:noUserLinkedDescription')}</p>
            {vendor.invitation_token ? (
              <div className="space-y-2">
                <Badge variant="light" color="warning">
                  {t('vendors:invitationPending')}
                </Badge>
                {vendor.invitation_expires_at && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('vendors:expiresAt')}: {new Date(vendor.invitation_expires_at).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link to={`/vendors/${vendor.id}/invite`}>
                    <Button variant="primary" size="sm">
                      {t('vendors:resendInvitation')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Link to={`/vendors/${vendor.id}/invite`}>
                <Button variant="primary" size="sm">
                  {t('vendors:sendInvitation')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
