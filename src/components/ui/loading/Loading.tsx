import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', type = 'spinner', className = '', text }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const renderSpinner = () => (
    <div
      className={clsx(
        twMerge(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400',
          getSizeStyles()
        )
      )}
    />
  );

  const renderDots = () => (
    <div className={clsx(twMerge('flex items-center justify-center space-x-1', getSizeStyles()))}>
      <div className="h-1/3 w-1/3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s] dark:bg-blue-400" />
      <div className="h-1/3 w-1/3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s] dark:bg-blue-400" />
      <div className="h-1/3 w-1/3 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400" />
    </div>
  );

  const renderPulse = () => (
    <div className={clsx(twMerge('animate-pulse rounded-full bg-blue-600 dark:bg-blue-400', getSizeStyles()))} />
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={clsx(twMerge('flex items-center justify-center', className))}>
      <div className="flex flex-col items-center space-y-3">
        {renderLoader()}
        {text && <p className={clsx(twMerge('font-medium text-gray-600 dark:text-gray-300', getTextSize()))}>{text}</p>}
      </div>
    </div>
  );
};
