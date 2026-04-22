"use client";

import { cn } from "@/utils/classnames";

export type TabItem = {
  label: string;
  value: string;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (nextValue: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-app-border bg-[#120d22] p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-gradient-to-r from-app-accent/90 to-app-accent-soft/90 text-white"
                : "text-app-text-secondary hover:text-app-text-primary",
            )}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
