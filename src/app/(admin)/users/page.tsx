"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers, useWalletAdjustment } from "@/features/users/use-users";
import type { User } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const debouncedSearch = useDebounce(search);

  const usersQuery = useUsers({
    page,
    pageSize: 10,
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
  });

  const walletAdjustment = useWalletAdjustment();
  const usersErrorMessage =
    usersQuery.error instanceof Error ? usersQuery.error.message : "Unknown error";

  const columns: DataColumn<User>[] = useMemo(
    () => [
      {
        key: "name",
        header: "User",
        render: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-app-text-secondary">{row.phone}</p>
          </div>
        ),
      },
      {
        key: "wallet",
        header: "Wallet",
        render: (row) => (
          <div>
            <p>{formatInr(row.walletBalance)}</p>
            <p className="text-xs text-app-text-secondary">
              Recharged: {formatInr(row.totalRecharge)}
            </p>
          </div>
        ),
      },
      {
        key: "spent",
        header: "Spent",
        render: (row) => <span>{formatInr(row.totalSpent)}</span>,
      },
      {
        key: "referral",
        header: "Referral Code",
        render: (row) => <span>{row.referralCode}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "joined",
        header: "Joined",
        render: (row) => <span>{formatDate(row.joinedAt)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedUser(row);
                setAdjustType("credit");
                setAdjustOpen(true);
              }}
            >
              Credit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedUser(row);
                setAdjustType("debit");
                setAdjustOpen(true);
              }}
            >
              Debit
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminLayout
      title="User Management"
      subtitle="Inspect users, manage account state, and perform wallet adjustments."
    >
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onFilterChange={(_, value) => setStatus(value)}
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "blocked", label: "Blocked" },
            ],
          },
        ]}
      />

      {usersQuery.isError ? (
        <Card className="space-y-3 p-4">
          <EmptyState
            title="Unable to load users"
            description="User records could not be fetched from the backend."
          />
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" onClick={() => usersQuery.refetch()}>
              Retry
            </Button>
          </div>
          {process.env.NODE_ENV !== "production" ? (
            <p className="text-center text-xs text-app-text-muted">
              Diagnostic: {usersErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      <DataTable
        data={usersQuery.data?.items ?? []}
        columns={columns}
        loading={usersQuery.isLoading}
        page={usersQuery.data?.page}
        totalPages={usersQuery.data?.totalPages}
        onPageChange={setPage}
        emptyLabel={
          usersQuery.isError ? "Unable to load users." : "No users found for selected filters."
        }
      />

      {adjustOpen ? (
        <Card className="fixed bottom-4 right-4 z-50 w-[340px] space-y-3 rounded-2xl border border-app-border p-4">
          <p className="text-sm font-semibold">
            {adjustType === "credit" ? "Credit" : "Debit"} Wallet
          </p>
          <Input
            placeholder="Amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <Input
            placeholder="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAdjustOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedUser || !amount || Number(amount) <= 0) {
                  return;
                }
                walletAdjustment.mutate({
                  userId: selectedUser.id,
                  type: adjustType,
                  amount: Number(amount),
                  reason: reason || "Manual adjustment",
                });
                setAdjustOpen(false);
                setSelectedUser(null);
              }}
            >
              Save
            </Button>
          </div>
        </Card>
      ) : null}
    </AdminLayout>
  );
}
