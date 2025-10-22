import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";
import { Permission } from "../../types/auth.types";

// Define your actions
export type Action = "view" | "create" | "update" | "delete" | "manage" | "assign" | "toggle" | "reset-password" | "read";

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
  | "Dashboard"
  | "Settings"
  | "all";

// Define the Ability type
export type AppAbility = MongoAbility<[Action, Subject]>;

// Create ability instance
export const createAbility = () => createMongoAbility<AppAbility>();

/**
 * Define abilities based on user permissions from API
 * Permissions format: "resource.action" (e.g., "users.view", "companies.create")
 */
export function defineAbilitiesFromPermissions(permissions: Permission[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  permissions.forEach((permission) => {
    const [subject, action] = permission.name.split(".");
    
    if (subject && action) {
      can(action as Action, subject as Subject);
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
