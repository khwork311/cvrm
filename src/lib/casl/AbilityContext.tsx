import { createContextualCan } from '@casl/react';
import { createContext } from 'react';
import { AppAbility, createAbility } from './ability';

// Create the context with a default ability
export const AbilityContext = createContext<AppAbility>(createAbility());

// Create the Can component
export const Can = createContextualCan(AbilityContext.Consumer);
