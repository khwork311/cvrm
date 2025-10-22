import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="dark:bg-gray-dark flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-red-500">403</h1>
        <h2 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">Access Denied</h2>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          You don't have permission to access this resource.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/" className="bg-primary hover:bg-opacity-90 rounded-lg px-6 py-3 text-white transition">
            Go to Dashboard
          </Link>
          <Link
            to="/signin"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
