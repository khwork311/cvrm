import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  imageLight?: string;
  imageDark?: string;
}

/**
 * Standardized Empty State Component
 * Used across all list pages for consistent empty state UI
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  imageLight = '/images/error/404.svg',
  imageDark = '/images/error/404-dark.svg',
}) => {
  return (
    <div className="mt-12 flex flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-md">
        {/* Icon or Image */}
        {icon ? (
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {icon}
          </div>
        ) : (
          <div className="mb-6">
            <img src={imageLight} alt="Empty state" className="mx-auto dark:hidden" />
            <img src={imageDark} alt="Empty state" className="mx-auto hidden dark:block" />
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white/90">{title}</h3>

        {/* Description */}
        {description && <p className="mb-6 text-gray-600 dark:text-gray-400">{description}</p>}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
