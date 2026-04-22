"use client";

import type { AdminRole } from "@/types";
import { useAuthContext } from "@/providers/auth-provider";

export function useRoleAccess(allowedRoles: AdminRole[]) {
  const { session } = useAuthContext();

  const hasAccess = Boolean(session?.role && allowedRoles.includes(session.role));

  return {
    role: session?.role,
    hasAccess,
  };
}
