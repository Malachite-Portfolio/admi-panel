"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { useReferrals, useUpdateReferralSettings } from "@/features/referrals/use-referrals";
import type { ReferralRecord } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

export default function ReferralsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [settings, setSettings] = useState({
    inviterReward: "",
    invitedReward: "",
    qualifyingRechargeAmount: "",
  });

  const referralsQuery = useReferrals({
    page,
    pageSize: 10,
    search,
    status: status === "all" ? undefined : status,
  });

  const updateSettings = useUpdateReferralSettings();

  const columns: DataColumn<ReferralRecord>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        render: (row) => <span>{row.referralCode}</span>,
      },
      {
        key: "inviter",
        header: "Inviter",
        render: (row) => <span>{row.inviterName}</span>,
      },
      {
        key: "invited",
        header: "Invited User",
        render: (row) => <span>{row.invitedUserName}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.rewardStatus} />,
      },
      {
        key: "reward",
        header: "Reward",
        render: (row) => <span className="font-semibold">{formatInr(row.rewardAmount)}</span>,
      },
      {
        key: "qualifying",
        header: "Qualifying Txn",
        render: (row) => <span>{row.qualifyingTransaction ?? "-"}</span>,
      },
      {
        key: "rewardedAt",
        header: "Rewarded At",
        render: (row) =>
          row.rewardedAt ? <span>{formatDateTime(row.rewardedAt)}</span> : <span>-</span>,
      },
    ],
    [],
  );

  return (
    <AdminLayout
      title="Referral Management"
      subtitle="Control referral rewards, detect abuse patterns, and manage payout eligibility."
    >
      <Card className="space-y-4">
        <CardTitle className="text-base">Referral Reward Settings</CardTitle>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={settings.inviterReward}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, inviterReward: event.target.value }))
            }
            placeholder="Inviter reward"
          />
          <Input
            value={settings.invitedReward}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, invitedReward: event.target.value }))
            }
            placeholder="Friend reward"
          />
          <Input
            value={settings.qualifyingRechargeAmount}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                qualifyingRechargeAmount: event.target.value,
              }))
            }
            placeholder="Qualifying amount"
          />
          <Button
            onClick={() =>
              updateSettings.mutate({
                inviterReward: Number(settings.inviterReward),
                invitedReward: Number(settings.invitedReward),
                qualifyingRechargeAmount: Number(settings.qualifyingRechargeAmount),
              })
            }
          >
            Save Rules
          </Button>
        </div>
      </Card>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onFilterChange={(_, value) => setStatus(value)}
        filters={[
          {
            key: "status",
            label: "Reward Status",
            value: status,
            options: [
              { value: "all", label: "All" },
              { value: "invited", label: "Invited" },
              { value: "signed_up", label: "Signed Up" },
              { value: "qualified", label: "Qualified" },
              { value: "rewarded", label: "Rewarded" },
              { value: "expired", label: "Expired" },
            ],
          },
        ]}
      />

      {referralsQuery.isError ? (
        <EmptyState
          title="Unable to load referrals"
          description="Referral records could not be fetched from the backend."
        />
      ) : null}

      <DataTable
        data={referralsQuery.data?.items ?? []}
        columns={columns}
        loading={referralsQuery.isLoading}
        page={referralsQuery.data?.page}
        totalPages={referralsQuery.data?.totalPages}
        onPageChange={setPage}
        emptyLabel={
          referralsQuery.isError
            ? "Unable to load referral records."
            : "No referral records found."
        }
      />
    </AdminLayout>
  );
}
