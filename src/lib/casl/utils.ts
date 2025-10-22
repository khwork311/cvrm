import { AppAbility, Action, Subject } from './ability';

/**
 * Check multiple permissions at once
 * Returns true only if ALL permissions are granted
 */
export function canAll(
  ability: AppAbility,
  permissions: Array<{ action: Action; subject: Subject }>
): boolean {
  return permissions.every(({ action, subject }) => ability.can(action, subject));
}

/**
 * Check multiple permissions at once
 * Returns true if ANY permission is granted
 */
export function canAny(
  ability: AppAbility,
  permissions: Array<{ action: Action; subject: Subject }>
): boolean {
  return permissions.some(({ action, subject }) => ability.can(action, subject));
}

/**
 * Get a list of all permissions for debugging
 */
export function getAllPermissions(ability: AppAbility): string[] {
  const rules = ability.rules;
  return rules.map((rule) => {
    const action = Array.isArray(rule.action) ? rule.action.join('|') : rule.action;
    const subject = Array.isArray(rule.subject) ? rule.subject.join('|') : rule.subject;
    const inverted = rule.inverted ? 'cannot' : 'can';
    return `${inverted} ${action} ${subject}`;
  });
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(ability: AppAbility): boolean {
  return ability.can('manage', 'all');
}

/**
 * Check if user is at least an editor (has write access)
 */
export function hasWriteAccess(ability: AppAbility): boolean {
  return ability.can('create', 'Post') || ability.can('manage', 'all');
}
