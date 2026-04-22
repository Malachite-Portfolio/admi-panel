"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useSupportTickets, useUpdateTicket } from "@/features/support/use-support";
import type { SupportTicket } from "@/types";
import { formatDateTime } from "@/utils/date";

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");

  const ticketsQuery = useSupportTickets({
    page,
    pageSize: 10,
    search,
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
  });

  const updateTicket = useUpdateTicket();

  const columns: DataColumn<SupportTicket>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Ticket ID",
        render: (row) => <span>{row.id}</span>,
      },
      {
        key: "user",
        header: "User / Host",
        render: (row) => (
          <div>
            <p>{row.userName}</p>
            <p className="text-xs text-app-text-secondary">{row.hostName ?? "N/A"}</p>
          </div>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        render: (row) => <span>{row.subject}</span>,
      },
      {
        key: "priority",
        header: "Priority",
        render: (row) => <StatusBadge status={row.priority} />,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "createdAt",
        header: "Created",
        render: (row) => <span>{formatDateTime(row.createdAt)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <Button size="sm" variant="secondary" onClick={() => setActiveTicket(row)}>
            Open
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <AdminLayout
      title="Support Tickets"
      subtitle="Assign, reply, and close support tickets across user and host issues."
    >
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === "status") setStatus(value);
          if (key === "priority") setPriority(value);
        }}
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            options: [
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "in_progress", label: "In Progress" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ],
          },
          {
            key: "priority",
            label: "Priority",
            value: priority,
            options: [
              { value: "all", label: "All" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ],
          },
        ]}
      />

      {ticketsQuery.isError ? (
        <EmptyState
          title="Unable to load support tickets"
          description="Ticket data could not be fetched from the backend."
        />
      ) : null}

      <DataTable
        data={ticketsQuery.data?.items ?? []}
        columns={columns}
        loading={ticketsQuery.isLoading}
        page={ticketsQuery.data?.page}
        totalPages={ticketsQuery.data?.totalPages}
        onPageChange={setPage}
        emptyLabel={
          ticketsQuery.isError
            ? "Unable to load support tickets."
            : "No support tickets found."
        }
      />

      {activeTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-card w-full max-w-xl rounded-2xl border border-app-border p-5">
            <p className="text-lg font-semibold">{activeTicket.subject}</p>
            <p className="mt-1 text-sm text-app-text-secondary">
              Ticket {activeTicket.id} • {activeTicket.userName}
            </p>

            <div className="mt-3 flex gap-2">
              <StatusBadge status={activeTicket.priority} />
              <StatusBadge status={activeTicket.status} />
            </div>

            <Textarea
              className="mt-4"
              placeholder="Reply to ticket..."
              value={reply}
              onChange={(event) => setReply(event.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveTicket(null);
                  setReply("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  await updateTicket.mutateAsync({
                    ticketId: activeTicket.id,
                    payload: { status: "in_progress", reply },
                  });
                  toast.success("Reply sent and ticket updated");
                  setActiveTicket(null);
                  setReply("");
                }}
              >
                Reply
              </Button>
              <Button
                onClick={async () => {
                  await updateTicket.mutateAsync({
                    ticketId: activeTicket.id,
                    payload: { status: "closed" },
                  });
                  toast.success("Ticket closed");
                  setActiveTicket(null);
                  setReply("");
                }}
              >
                Close Ticket
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
