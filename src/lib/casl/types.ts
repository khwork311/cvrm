/**
 * Additional TypeScript types for CASL integration
 */

import { Action, AppAbility, Subject } from './ability';

/**
 * Permission check object
 */
export interface Permission {
  action: Action;
  subject: Subject;
}

/**
 * User role type
 */
export type UserRole = 'admin' | 'editor' | 'user' | 'guest';

/**
 * Props for components that need permission checks
 */
export interface WithPermissionProps {
  ability?: AppAbility;
  requiredPermission?: Permission;
}

/**
 * Route protection configuration
 */
export interface RouteProtection {
  action: Action;
  subject: Subject;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * User with role information
 */
export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
