import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";
import { Permission } from "../../types/auth.types";

// Define your actions
export type Action = "view" | "create" | "update" | "delete" | "manage" | "assign" | "toggle" | "reset-password" | "read" | string;

// Define your subjects (resources)
export type Subject =
  | "users"
  | "roles"
  | "permissions"
  | "dashboard"
  | "companies"
  | "customers"
  | "vendors"
  | "User"
  | "Post"
  | "Comment"
  | "Analytics"
  | "Activity"
  | "Dashboard"
  | "Settings"
  | "all"
  | string;

// Define the Ability type
export type AppAbility = MongoAbility<[Action, Subject]>;

// Create ability instance
export const createAbility = () => createMongoAbility<AppAbility>();

/**
 * Define abilities based on user permissions from API
 * Permissions format: "resource.action" (e.g., "users.view", "companies.create")
 * or "action.resource" (e.g., "view.Activity", "create.users")
 */
export function defineAbilitiesFromPermissions(permissions: Permission[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  permissions.forEach((permission) => {
    const parts = permission.name.split(".");
    
    if (parts.length !== 2) {
      console.warn(`Invalid permission format: ${permission.name}. Expected format: "resource.action" or "action.resource"`);
      return;
    }

    const [first, second] = parts;
    
    if (!first || !second) {
      console.warn(`Invalid permission format: ${permission.name}. Both parts must be non-empty`);
      return;
    }

    // Try to determine if it's "action.resource" or "resource.action"
    // Common actions: view, create, update, delete, manage, assign, toggle, reset-password, read
    const commonActions = ["view", "create", "update", "delete", "manage", "assign", "toggle", "reset-password", "read"];
    
    if (commonActions.includes(first.toLowerCase())) {
      // Format is "action.resource"
      can(first as Action, second as Subject);
    } else if (commonActions.includes(second.toLowerCase())) {
      // Format is "resource.action"
      can(second as Action, first as Subject);
    } else {
      // Assume "resource.action" format
      can(second as Action, first as Subject);
    }
  });

  return build();
}

/**
 * Define abilities based on user role (fallback/legacy method)
 */
export function defineAbilitiesFor(role: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  );

  switch (role) {
    case "super_admin":
      // Super admin can do everything
      can("manage", "all");
      break;

    case "admin":
      // Admin can manage companies, customers, vendors
      can("view", "dashboard");
      can(["view", "create", "update", "delete"], "companies");
      can(["view", "create", "update", "delete"], "customers");
      can(["view", "create", "update", "delete"], "vendors");
      break;

    case "user":
      // Regular user can only view
      can("view", "dashboard");
      can("view", ["companies", "customers", "vendors"]);
      break;

    case "guest":
    default:
      // Guest has no permissions
      break;
  }

  return build();
}
