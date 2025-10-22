import { Loading } from './Loading';

interface SectionLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SectionLoading: React.FC<SectionLoadingProps> = ({ text, size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <Loading size={size} type="spinner" />
        {text && <p className="font-medium text-gray-600 dark:text-gray-300">{text}</p>}
      </div>
    </div>
  );
};
