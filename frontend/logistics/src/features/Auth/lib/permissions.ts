import type { User } from "../types/types";

export type Role = "administrador" | "gerente" | "operador" | "usuario" | string;

export type Permission =
  | "rates:view"
  | "rates:generate"
  | "rates:modify"
  | "payments:view"
  | "despacho:edit";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  administrador: [
    "rates:view",
    "rates:generate",
    "rates:modify",
    "payments:view",
    "despacho:edit",
  ],
  gerente: [
    "rates:view",
    "rates:generate",
    "rates:modify",
    "payments:view",
  ],
  operador: [
    "rates:view",
  ],
  usuario: [
    "rates:view",
  ],
};

/**
 * Checks if a user has a specific permission based on their role.
 */
export function hasPermission(
  user: User | null | undefined,
  permission: Permission
): boolean {
  if (!user || !user.rol) return false;

  const userRole = user.rol.toLowerCase();
  const permissions = ROLE_PERMISSIONS[userRole];

  if (!permissions) return false;

  return permissions.includes(permission);
}
