import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorDisplayProps {
  error?: any;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * Standardized Error Display Component
 * Used for consistent error handling across the application
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, title, message, onRetry }) => {
  const { t } = useTranslation('common');

  const errorMessage = message || error?.response?.data?.message || error?.message || t('errorOccurred', 'An error occurred');
  const errorTitle = title || t('error', 'Error');

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-4">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-red-800 dark:text-red-300">{errorTitle}</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">{errorMessage}</p>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t('retry', 'Retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Validation Errors Display Component
 * Used for displaying API validation errors
 */
interface ValidationErrorsProps {
  errors: Record<string, string[]>;
  title?: string;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors, title }) => {
  const { t } = useTranslation('common');

  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
            {title || t('validationError', 'Please fix the following errors:')}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
            {Object.entries(errors).map(([field, messages]) =>
              messages.map((message, idx) => (
                <li key={`${field}-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400"></span>
                  <span>{message}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
