"use client";

import { ShieldAlert } from "lucide-react";
import type { AdminRole } from "@/types";
import { useRoleAccess } from "@/hooks/useRoleAccess";

type RoleGateProps = {
  roles: AdminRole[];
  children: React.ReactNode;
};

export function RoleGate({ roles, children }: RoleGateProps) {
  const { hasAccess } = useRoleAccess(roles);

  if (!hasAccess) {
    return (
      <div className="glass-card flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-app-border p-6 text-center">
        <div className="rounded-full bg-app-danger/20 p-3">
          <ShieldAlert className="h-5 w-5 text-app-danger" />
        </div>
        <p className="mt-3 font-semibold">Access Restricted</p>
        <p className="mt-1 text-sm text-app-text-secondary">
          Your role does not have permission to view this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
