"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { APP_VERSION } from "@/constants/app";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/utils/classnames";
import { useAuthContext } from "@/providers/auth-provider";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
};

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onToggleMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuthContext();

  const content = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between">
          {!collapsed ? (
            <div>
              <p className="font-display text-xl font-bold tracking-tight">Clarivoice</p>
              <p className="text-xs text-app-text-secondary">Admin Panel</p>
            </div>
          ) : (
            <div className="font-display text-xl font-bold">CV</div>
          )}
          <button
            className="rounded-lg border border-app-border p-2 text-app-text-secondary hover:bg-white/10"
            onClick={onToggleCollapsed}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            if (!session || !item.roles.includes(session.role)) {
              return null;
            }

            const active =
              item.href === "/dashboard"
                ? pathname.startsWith("/dashboard")
                : pathname.startsWith(item.href);

            const Icon = item.icon;
            const isLogout = item.label === "Logout";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (isLogout) {
                    logout();
                    router.push("/login");
                    return;
                  }
                  router.push(item.href);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                  active
                    ? "bg-gradient-to-r from-app-accent/20 to-app-accent-soft/20 text-app-text-primary accent-glow"
                    : "text-app-text-secondary hover:bg-white/[0.04] hover:text-app-text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 rounded-2xl border border-app-border bg-black/20 p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border border-app-accent/40 bg-app-accent/20" />
          {!collapsed ? (
            <div>
              <p className="text-sm font-medium">{session?.name ?? "Admin"}</p>
              <p className="text-xs text-app-text-secondary">{session?.email}</p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <p className="text-xs text-app-text-muted">App {APP_VERSION}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen border-r border-app-border bg-[#0d081a] transition-all lg:block",
          collapsed ? "w-[84px]" : "w-[280px]",
        )}
      >
        {content}
      </aside>

      <div className="lg:hidden">
        <button
          className="fixed left-4 top-4 z-40 rounded-lg border border-app-border bg-[#120d22] p-2 text-app-text-secondary"
          onClick={onToggleMobile}
        >
          <Menu className="h-4 w-4" />
        </button>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-[280px] border-r border-app-border bg-[#0d081a]">
              <div className="flex justify-end p-3">
                <button
                  className="rounded-lg border border-app-border p-2 text-app-text-secondary"
                  onClick={onToggleMobile}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {content}
            </div>
            <button
              className="flex-1 bg-black/70"
              onClick={onToggleMobile}
              aria-label="Close menu overlay"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
