import { ReactNode, useState, useEffect } from 'react';
import { AbilityContext } from './AbilityContext';
import { defineAbilitiesFor, AppAbility } from './ability';

interface AbilityProviderProps {
  children: ReactNode;
  userRole?: string;
}

export const AbilityProvider = ({ children, userRole = 'guest' }: AbilityProviderProps) => {
  const [ability, setAbility] = useState<AppAbility>(() => defineAbilitiesFor(userRole));

  useEffect(() => {
    // Update ability when user role changes
    setAbility(defineAbilitiesFor(userRole));
  }, [userRole]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
