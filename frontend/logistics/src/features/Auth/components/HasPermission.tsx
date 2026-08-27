import type { ReactNode } from "react";
import { useHasPermission } from "../hooks/useHasPermission";
import type { Permission } from "../lib/permissions";

interface HasPermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function HasPermission({
  permission,
  children,
  fallback = null,
}: HasPermissionProps) {
  const allowed = useHasPermission(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
