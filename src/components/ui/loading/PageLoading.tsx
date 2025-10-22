import { Loading } from './Loading';

interface PageLoadingProps {
  text?: string;
  overlay?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ text = 'Loading...', overlay = true }) => {
  return (
    <div
      className={`fixed inset-0 z-99999 flex items-center justify-center ${
        overlay ? 'bg-white/80 backdrop-blur-sm dark:bg-gray-900/80' : ''
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        <Loading size="xl" type="spinner" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{text}</p>
      </div>
    </div>
  );
};
