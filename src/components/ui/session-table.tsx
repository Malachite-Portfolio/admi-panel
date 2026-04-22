import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LiveSession } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type SessionTableProps = {
  sessions: LiveSession[];
  loading?: boolean;
  emptyLabel?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export function SessionTable({
  sessions,
  loading,
  emptyLabel,
  page,
  totalPages,
  onPageChange,
}: SessionTableProps) {
  const columns: DataColumn<LiveSession>[] = [
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className="rounded-full bg-app-accent-bg px-2 py-1 text-xs font-medium capitalize text-app-accent">
          {row.type}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (row) => <span className="text-app-text-primary">{row.userName}</span>,
    },
    {
      key: "host",
      header: "Host",
      render: (row) => <span className="text-app-text-primary">{row.hostName}</span>,
    },
    {
      key: "start",
      header: "Start Time",
      render: (row) => <span className="text-app-text-secondary">{formatDateTime(row.startTime)}</span>,
    },
    {
      key: "duration",
      header: "Running Duration",
      render: (row) => (
        <span className="text-app-text-secondary">
          {Math.floor(row.runningDurationSeconds / 60)}m {row.runningDurationSeconds % 60}s
        </span>
      ),
    },
    {
      key: "billing",
      header: "Current Billing",
      render: (row) => <span className="font-semibold">{formatInr(row.currentBilling)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DataTable
      data={sessions}
      columns={columns}
      loading={loading}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyLabel={emptyLabel ?? "No sessions found."}
    />
  );
}
