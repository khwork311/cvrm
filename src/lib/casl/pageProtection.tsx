import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Action, Subject } from './ability';
import { useAbility, useCan } from './hooks';

/**
 * Hook to check page access and redirect if unauthorized
 * Use this inside page components for programmatic protection
 */
export function usePageProtection(action: Action, subject: Subject, redirectTo = '/unauthorized') {
  const canAccess = useCan(action, subject);
  const navigate = useNavigate();

  const checkAccess = () => {
    if (!canAccess) {
      navigate(redirectTo, { replace: true });
      return false;
    }
    return true;
  };

  return { canAccess, checkAccess };
}

/**
 * Component to conditionally render page sections based on permissions
 */
interface PageSectionProps {
  action: Action;
  subject: Subject;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PageSection({ action, subject, children, fallback = null }: PageSectionProps) {
  const canView = useCan(action, subject);

  if (!canView) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to show different content based on multiple permission levels
 */
interface TieredPageContentProps {
  children: ReactNode;
  adminContent?: ReactNode;
  editorContent?: ReactNode;
  userContent?: ReactNode;
  guestContent?: ReactNode;
}

export function TieredPageContent({
  children,
  adminContent,
  editorContent,
  userContent,
  guestContent,
}: TieredPageContentProps) {
  const ability = useAbility();

  // Check permissions in order of precedence
  if (ability.can('manage', 'all') && adminContent) {
    return <>{adminContent}</>;
  }

  if (ability.can('create', 'Post') && ability.can('read', 'Analytics') && editorContent) {
    return <>{editorContent}</>;
  }

  if (ability.can('read', 'Dashboard') && ability.can('create', 'Comment') && userContent) {
    return <>{userContent}</>;
  }

  if (guestContent) {
    return <>{guestContent}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to get page visibility permissions for navigation
 */
export function usePageVisibility() {
  const ability = useAbility();

  return {
    // Dashboard & Analytics
    canViewDashboard: ability.can('read', 'Dashboard'),
    canViewAnalytics: ability.can('read', 'Analytics'),

    // User Management
    canViewProfile: ability.can('read', 'User'),
    canEditProfile: ability.can('update', 'User'),
    canManageUsers: ability.can('manage', 'User'),

    // Content Management
    canViewPosts: ability.can('read', 'Post'),
    canCreatePost: ability.can('create', 'Post'),
    canEditPost: ability.can('update', 'Post'),
    canDeletePost: ability.can('delete', 'Post'),

    // Comments
    canViewComments: ability.can('read', 'Comment'),
    canCreateComment: ability.can('create', 'Comment'),
    canEditComment: ability.can('update', 'Comment'),
    canDeleteComment: ability.can('delete', 'Comment'),

    // Settings
    canViewSettings: ability.can('read', 'Settings'),
    canManageSettings: ability.can('manage', 'Settings'),

    // Admin
    isAdmin: ability.can('manage', 'all'),
  };
}

/**
 * Component wrapper that shows loading or unauthorized state
 */
interface ProtectedPageProps {
  action: Action;
  subject: Subject;
  children: ReactNode;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

export function ProtectedPage({ action, subject, children, unauthorizedComponent }: ProtectedPageProps) {
  const canAccess = useCan(action, subject);

  if (unauthorizedComponent && !canAccess) {
    return <>{unauthorizedComponent}</>;
  }

  if (!canAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page.</p>
          <a href="/" className="bg-primary hover:bg-opacity-90 mt-4 inline-block rounded-lg px-6 py-3 text-white">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
