"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  revenueToday?: number;
  onSearch?: (value: string) => void;
};

export function AdminLayout({
  children,
  title,
  subtitle,
  revenueToday,
  onSearch,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const spacing = useMemo(
    () => (collapsed ? "lg:max-w-[calc(100vw-84px)]" : "lg:max-w-[calc(100vw-280px)]"),
    [collapsed],
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((prev) => !prev)}
      />
      <main className={`flex-1 p-4 lg:p-6 ${spacing}`}>
        <Header
          title={title}
          subtitle={subtitle}
          revenueToday={revenueToday}
          onSearch={onSearch}
        />
        <div className="space-y-5">{children}</div>
      </main>
    </div>
  );
}
