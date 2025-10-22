import { useToast } from '@/context/ToastContext';
import { CopyIcon } from '@/icons';
import { useState } from 'react';

interface CopyOnClickProps {
  /** The text to be copied to clipboard */
  textToCopy: string;
  /** The content to display (can be different from textToCopy) */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Show copy icon on hover */
  showIcon?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Disable the copy functionality */
  disabled?: boolean;
  /** Prevent copy when clicking on child links/buttons */
  preventCopyOnChildClick?: boolean;
}

export const CopyOnClick: React.FC<CopyOnClickProps> = ({
  textToCopy,
  children,
  className = '',
  showIcon = true,
  successMessage = 'Copied to clipboard!',
  errorMessage = 'Failed to copy to clipboard',
  disabled = false,
  preventCopyOnChildClick = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const toast = useToast();

  const handleCopy = async (event: React.MouseEvent) => {
    if (disabled) return;

    // Prevent copy if clicking on a link or button inside the component
    if (preventCopyOnChildClick) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(successMessage);

      // Visual feedback
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    } catch (error) {
      console.error('Failed to copy text:', error);

      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        toast.success(successMessage);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        toast.error(errorMessage);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Create a synthetic mouse event for keyboard interactions
      const syntheticEvent = {
        target: event.target,
        currentTarget: event.currentTarget,
      } as React.MouseEvent;
      handleCopy(syntheticEvent);
    }
  };

  const baseClasses = `
    inline-flex items-center gap-1 transition-all duration-200
    ${
      disabled
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-pointer hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded'
    }
    ${isClicked ? 'scale-95' : ''}
    ${className}
  `.trim();

  return (
    <span
      className={baseClasses + ' relative'}
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={disabled ? 'Copy disabled' : `Click to copy: ${textToCopy}`}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Copy ${textToCopy} to clipboard`}
    >
      {children}
      {showIcon && (isHovered || isClicked) && !disabled && (
        <CopyIcon
          className={`absolute top-3 right-0 ml-1 h-3 w-3 transition-all duration-200 ${
            isClicked ? 'scale-110 text-green-500' : 'text-red-600 hover:text-blue-500'
          }`}
        />
      )}
    </span>
  );
};

export default CopyOnClick;
