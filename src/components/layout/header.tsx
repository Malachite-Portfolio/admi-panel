"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatInr } from "@/utils/currency";

type HeaderProps = {
  title: string;
  subtitle?: string;
  revenueToday?: number;
  onSearch?: (value: string) => void;
};

export function Header({ title, subtitle, revenueToday, onSearch }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-app-border bg-[#100a21]/80 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pl-12 lg:pl-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-app-text-secondary">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {typeof revenueToday === "number" ? (
            <div className="rounded-full border border-app-border bg-app-accent-bg px-4 py-1.5 text-sm font-semibold text-app-accent">
              Revenue Today: {formatInr(revenueToday)}
            </div>
          ) : null}
          <button className="rounded-xl border border-app-border p-2 text-app-text-secondary hover:bg-white/[0.06]">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {onSearch ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted" />
          <Input
            placeholder="Search user, host, ticket..."
            className="pl-9"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      ) : null}
    </header>
  );
}
