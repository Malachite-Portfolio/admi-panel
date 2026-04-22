"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/classnames";

export type DataColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  data: T[];
  columns: DataColumn<T>[];
  loading?: boolean;
  emptyLabel?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  selectedIds?: string[];
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  emptyLabel = "No data available.",
  page = 1,
  totalPages = 1,
  onPageChange,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds?.length === data.length;

  return (
    <div className="glass-card overflow-hidden rounded-3xl border border-app-border">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-app-border bg-white/[0.02]">
              {selectedIds ? (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    className="h-4 w-4 rounded border-app-border bg-transparent accent-app-accent"
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-app-text-muted",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectedIds ? 1 : 0)}
                  className="px-4 py-14 text-center text-sm text-app-text-secondary"
                >
                  Loading data...
                </td>
              </tr>
            ) : null}

            {!loading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectedIds ? 1 : 0)}
                  className="px-4 py-14 text-center text-sm text-app-text-secondary"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : null}

            {!loading &&
              data.map((row) => (
                <tr key={row.id} className="border-b border-app-border/70">
                  {selectedIds ? (
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => onToggleRow?.(row.id)}
                        className="h-4 w-4 rounded border-app-border bg-transparent accent-app-accent"
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top text-sm">
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {onPageChange ? (
        <div className="flex items-center justify-end gap-2 border-t border-app-border px-4 py-3">
          <button
            className="rounded-lg border border-app-border p-2 text-app-text-secondary transition hover:bg-white/10 disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-app-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            className="rounded-lg border border-app-border p-2 text-app-text-secondary transition hover:bg-white/10 disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
