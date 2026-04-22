"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";

export type FilterField = {
  key: string;
  label: string;
  value: string;
  options: SelectOption[];
};

type SearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterField[];
  onFilterChange?: (key: string, value: string) => void;
  onResetFilters?: () => void;
  actionSlot?: React.ReactNode;
};

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  filters = [],
  onFilterChange,
  onResetFilters,
  actionSlot,
}: SearchFilterBarProps) {
  return (
    <div className="glass-card rounded-2xl border border-app-border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label className="mb-2 block text-xs font-medium text-app-text-muted">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, phone, email..."
              className="pl-9"
            />
          </div>
        </div>

        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[160px]">
            <label className="mb-2 block text-xs font-medium text-app-text-muted">
              {filter.label}
            </label>
            <Select
              value={filter.value}
              onChange={(event) => onFilterChange?.(filter.key, event.target.value)}
              options={filter.options}
            />
          </div>
        ))}

        {onResetFilters ? (
          <Button variant="secondary" onClick={onResetFilters}>
            Reset
          </Button>
        ) : null}

        {actionSlot}
      </div>
    </div>
  );
}
