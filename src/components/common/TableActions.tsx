import React from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, EyeIcon, TrashBinIcon } from '@/icons';
import { useTranslation } from 'react-i18next';

interface TableAction {
  type: 'view' | 'edit' | 'delete' | 'custom';
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
}

interface TableActionsProps {
  actions: TableAction[];
  variant?: 'buttons' | 'compact';
}

/**
 * Standardized Table Actions Component
 * Provides consistent action buttons for table rows
 */
export const TableActions: React.FC<TableActionsProps> = ({ actions, variant = 'buttons' }) => {
  const { t } = useTranslation('common');

  const getDefaultIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <EyeIcon className="h-4 w-4" />;
      case 'edit':
        return <PencilIcon className="h-4 w-4" />;
      case 'delete':
        return <TrashBinIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getDefaultLabel = (type: string) => {
    switch (type) {
      case 'view':
        return t('view', 'View');
      case 'edit':
        return t('edit', 'Edit');
      case 'delete':
        return t('delete', 'Delete');
      default:
        return '';
    }
  };

  const getButtonClass = (type: string, disabled?: boolean) => {
    const baseClass =
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';

    if (disabled) {
      return `${baseClass} cursor-not-allowed opacity-50 bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400`;
    }

    switch (type) {
      case 'view':
        return `${baseClass} bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md focus:ring-gray-500`;
      case 'edit':
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500`;
      case 'delete':
        return `${baseClass} bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500`;
      default:
        return `${baseClass} bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md focus:ring-gray-500`;
    }
  };

  const getCompactButtonClass = (type: string, disabled?: boolean) => {
    const baseClass =
      'inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';

    if (disabled) {
      return `${baseClass} cursor-not-allowed opacity-50 bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600`;
    }

    switch (type) {
      case 'view':
        return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 focus:ring-gray-500`;
      case 'edit':
        return `${baseClass} bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 focus:ring-blue-500`;
      case 'delete':
        return `${baseClass} bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-500`;
      default:
        return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 focus:ring-gray-500`;
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {actions.map((action, index) => {
        const icon = action.icon || getDefaultIcon(action.type);
        const label = action.label || getDefaultLabel(action.type);
        const className =
          action.className || (variant === 'compact' ? getCompactButtonClass(action.type, action.disabled) : getButtonClass(action.type, action.disabled));

        if (action.to) {
          return (
            <Link
              key={index}
              to={action.to}
              className={className}
              title={label}
              onClick={(e) => action.disabled && e.preventDefault()}
            >
              {icon}
              {variant === 'buttons' && <span>{label}</span>}
            </Link>
          );
        }

        return (
          <button
            key={index}
            onClick={action.onClick}
            className={className}
            title={label}
            disabled={action.disabled}
          >
            {icon}
            {variant === 'buttons' && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default TableActions;
