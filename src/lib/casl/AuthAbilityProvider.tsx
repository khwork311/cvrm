import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AbilityContext } from './AbilityContext';
import { AppAbility, createAbility, defineAbilitiesFor, defineAbilitiesFromPermissions } from './ability';

interface AuthAbilityProviderProps {
  children: ReactNode;
}

/**
 * AbilityProvider that integrates with AuthContext
 * Automatically updates abilities based on logged-in user's permissions
 */
export const AuthAbilityProvider = ({ children }: AuthAbilityProviderProps) => {
  const { user, isLoading } = useAuth();
  const [ability, setAbility] = useState<AppAbility>(() => createAbility());

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user && user.permissions && user.permissions.length > 0) {
      // Use permissions from API
      setAbility(defineAbilitiesFromPermissions(user.permissions));
    } else if (user && user.role) {
      // Fallback to role-based permissions
      setAbility(defineAbilitiesFor(user.role.name));
    } else {
      // No user, create empty ability
      setAbility(createAbility());
    }
  }, [user, isLoading]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
};
