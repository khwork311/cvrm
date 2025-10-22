import { useContext } from 'react';
import { AbilityContext } from './AbilityContext';
import { Action, Subject } from './ability';

/**
 * Hook to access the current user's ability
 */
export const useAbility = () => {
  return useContext(AbilityContext);
};

/**
 * Hook to check if user can perform an action on a subject
 */
export const useCan = (action: Action, subject: Subject) => {
  const ability = useAbility();
  return ability.can(action, subject);
};

/**
 * Hook to check if user cannot perform an action on a subject
 */
export const useCannot = (action: Action, subject: Subject) => {
  const ability = useAbility();
  return ability.cannot(action, subject);
};
