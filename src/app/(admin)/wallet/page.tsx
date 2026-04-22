"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RECHARGE_FEATURE_ENABLED } from "@/constants/features";
import { useDebounce } from "@/hooks/useDebounce";
import { useManualWalletAdjustment, useWalletOverview, useWalletTransactions } from "@/features/wallet/use-wallet";
import type { WalletTransaction } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

export default function WalletPage() {
  const overviewQuery = useWalletOverview();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustPayload, setAdjustPayload] = useState({
    userId: "",
    type: "credit" as "credit" | "debit",
    amount: "",
    reason: "",
  });

  const debouncedSearch = useDebounce(search);

  const transactionsQuery = useWalletTransactions({
    page,
    pageSize: 10,
    search: debouncedSearch,
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  });

  const manualAdjustment = useManualWalletAdjustment();
  const showRechargeUi = RECHARGE_FEATURE_ENABLED;

  const columns: DataColumn<WalletTransaction>[] = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        render: (row) => (
          <div>
            <p>{row.userName}</p>
            <p className="text-xs text-app-text-secondary">{row.userId}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (row) => <StatusBadge status={row.type} />,
      },
      {
        key: "amount",
        header: "Amount",
        render: (row) => <span className="font-semibold">{formatInr(row.amount)}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "balance",
        header: "Balance Change",
        render: (row) => (
          <span>
            {formatInr(row.balanceBefore)} → {formatInr(row.balanceAfter)}
          </span>
        ),
      },
      {
        key: "method",
        header: "Method",
        render: (row) => <span>{row.paymentMethod ?? "-"}</span>,
      },
      {
        key: "time",
        header: "Time",
        render: (row) => <span>{formatDateTime(row.createdAt)}</span>,
      },
    ],
    [],
  );

  const overview = overviewQuery.data;

  return (
    <AdminLayout
      title="Wallet & Payment Management"
      subtitle={
        showRechargeUi
          ? "Track recharge flow, payment health, and suspicious transaction patterns."
          : "Track wallet ledger health and manual adjustments while recharge is disabled."
      }
    >
      <RoleGate roles={["super_admin", "admin"]}>
      {overviewQuery.isError ? (
        <EmptyState
          title="Unable to load wallet overview"
          description="Wallet overview metrics are currently unavailable."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={showRechargeUi ? "Recharge Volume" : "Wallet Volume"}
            value={overview ? formatInr(overview.totalRechargeVolume) : "--"}
          />
          <StatCard
            label="Pending Payments"
            value={overview ? String(overview.pendingPayments) : "--"}
          />
          <StatCard
            label="Failed Payments"
            value={overview ? String(overview.failedPayments) : "--"}
          />
          <StatCard
            label="Refunds"
            value={overview ? String(overview.refunds) : "--"}
            subValue={`Coupon Usage: ${overview?.couponUsage ?? "--"}`}
          />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === "type") setType(value);
          if (key === "status") setStatus(value);
        }}
        filters={[
          {
            key: "type",
            label: "Type",
            value: type,
            options: [
              { value: "all", label: "All" },
              ...(showRechargeUi ? [{ value: "recharge", label: "Recharge" }] : []),
              { value: "call_debit", label: "Call Debit" },
              { value: "chat_debit", label: "Chat Debit" },
              { value: "referral_bonus", label: "Referral Bonus" },
            ],
          },
          {
            key: "status",
            label: "Status",
            value: status,
            options: [
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
        actionSlot={
          <Button variant="secondary" onClick={() => setAdjustOpen((prev) => !prev)}>
            Manual Adjustment
          </Button>
        }
      />

      {adjustOpen ? (
        <div className="glass-card grid gap-3 rounded-2xl border border-app-border p-4 md:grid-cols-5">
          <Input
            placeholder="User ID"
            value={adjustPayload.userId}
            onChange={(event) =>
              setAdjustPayload((prev) => ({ ...prev, userId: event.target.value }))
            }
          />
          <select
            value={adjustPayload.type}
            onChange={(event) =>
              setAdjustPayload((prev) => ({
                ...prev,
                type: event.target.value as "credit" | "debit",
              }))
            }
            className="h-11 rounded-xl border border-app-border bg-[#140f26] px-3 text-sm text-app-text-secondary"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <Input
            placeholder="Amount"
            value={adjustPayload.amount}
            onChange={(event) =>
              setAdjustPayload((prev) => ({ ...prev, amount: event.target.value }))
            }
          />
          <Input
            placeholder="Reason"
            value={adjustPayload.reason}
            onChange={(event) =>
              setAdjustPayload((prev) => ({ ...prev, reason: event.target.value }))
            }
          />
          <Button
            onClick={() =>
              manualAdjustment.mutate({
                userId: adjustPayload.userId,
                type: adjustPayload.type,
                amount: Number(adjustPayload.amount),
                reason: adjustPayload.reason || "Admin adjustment",
              })
            }
          >
            Submit
          </Button>
        </div>
      ) : null}

      <DataTable
        data={transactionsQuery.data?.items ?? []}
        columns={columns}
        loading={transactionsQuery.isLoading}
        page={transactionsQuery.data?.page}
        totalPages={transactionsQuery.data?.totalPages}
        onPageChange={setPage}
        emptyLabel={
          transactionsQuery.isError
            ? "Unable to load wallet transactions."
            : "No wallet transactions found."
        }
      />
      </RoleGate>
    </AdminLayout>
  );
}
