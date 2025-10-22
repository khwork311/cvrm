import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  helperText?: string;
  dir?: 'ltr' | 'rtl';
}

/**
 * Reusable Input component that integrates with react-hook-form
 * Follows Single Responsibility Principle - only handles input rendering and styling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, helperText, className = '', dir, id, ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={id}
          dir={dir}
          className={`shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            errorMessage ? 'border-red-500 focus:border-red-500' : ''
          } ${className}`}
          aria-invalid={errorMessage ? 'true' : 'false'}
          aria-describedby={errorMessage ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        
        {errorMessage && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
        
        {helperText && !errorMessage && (
          <p id={`${id}-helper`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
