import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

/**
 * Reusable Button component following SOLID principles
 * Single Responsibility: Renders a styled button with various variants
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      loadingText,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-hidden focus:ring-3 disabled:opacity-50 disabled:cursor-not-allowed';

    // Size variants
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Variant styles
    const variantStyles = {
      primary:
        'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500/10 dark:bg-brand-600 dark:hover:bg-brand-700',
      secondary:
        'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500/10 dark:bg-gray-600 dark:hover:bg-gray-700',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-800',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/10 dark:bg-red-600 dark:hover:bg-red-700',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : 'w-auto';

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`;

    return (
      <button ref={ref} className={combinedClassName} disabled={disabled || loading} {...props}>
        {loading && (
          <svg className="me-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
