import { useAuthStore } from "../store/zustandstore";
import { hasPermission } from "../lib/permissions";
import type { Permission } from "../lib/permissions";

export function useHasPermission(permission: Permission): boolean {
  const user = useAuthStore((state) => state.user);
  return hasPermission(user, permission);
}
