import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guest Route Component
 * Redirects to dashboard if user is already authenticated
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-16 w-16 animate-spin rounded-full border-4 border-solid border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
