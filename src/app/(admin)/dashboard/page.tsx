"use client";

import Link from "next/link";
import {
  CircleDollarSign,
  Headset,
  MessageSquareMore,
  UsersRound,
  UserSquare,
  Wallet,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RevenueLineChart } from "@/components/charts/revenue-line-chart";
import { TopHostsBarChart } from "@/components/charts/top-hosts-bar-chart";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionTable } from "@/components/ui/session-table";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { RECHARGE_FEATURE_ENABLED } from "@/constants/features";
import { useDashboardData } from "@/features/dashboard/use-dashboard-data";
import type { WalletTransaction } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

export default function DashboardPage() {
  const { summary, revenueSeries, topHosts, recentSessions, recentRecharges } =
    useDashboardData();

  const summaryData = summary.data;
  const revenueData = revenueSeries.data ?? [];
  const topHostsData = topHosts.data ?? [];
  const recentSessionData = recentSessions.data ?? [];
  const recentRechargeData = recentRecharges.data ?? [];
  const liveCalls = summaryData?.liveCalls ?? summaryData?.liveCallsNow ?? 0;
  const liveChats = summaryData?.liveChats ?? summaryData?.liveChatsNow ?? 0;
  const showRechargeUi = RECHARGE_FEATURE_ENABLED;

  const rechargeColumns: DataColumn<WalletTransaction>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => <span>{row.userName}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <span className="font-semibold">{formatInr(row.amount)}</span>,
    },
    {
      key: "method",
      header: "Method",
      render: (row) => <span className="text-app-text-secondary">{row.paymentMethod}</span>,
    },
    {
      key: "time",
      header: "Time",
      render: (row) => <span className="text-app-text-secondary">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  return (
    <AdminLayout
      title="Operations Dashboard"
      subtitle="Control hosts, monitor revenue, and track active sessions in real-time."
      revenueToday={summaryData?.revenueToday}
    >
      {summary.isError && !summaryData ? (
        <EmptyState
          title="Unable to load dashboard summary"
          description="Core dashboard metrics are currently unavailable."
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={summaryData ? summaryData.totalUsers.toLocaleString("en-IN") : "--"}
          icon={<UsersRound className="h-4 w-4" />}
        />
        <StatCard
          label="Total Hosts"
          value={summaryData ? summaryData.totalHosts.toLocaleString("en-IN") : "--"}
          subValue={`Active: ${summaryData?.activeHosts ?? "--"}`}
          icon={<Headset className="h-4 w-4" />}
        />
        <StatCard
          label="Live Calls"
          value={summaryData ? String(liveCalls) : "--"}
          subValue={`Chats: ${summaryData ? String(liveChats) : "--"}`}
          icon={<MessageSquareMore className="h-4 w-4" />}
        />
        <StatCard
          label="Revenue Today"
          value={summaryData ? formatInr(summaryData.revenueToday) : "--"}
          subValue={
            showRechargeUi
              ? `Recharge: ${summaryData ? formatInr(summaryData.rechargeToday) : "--"}`
              : "Recharge: Coming soon"
          }
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Pending Host Approvals"
          value={summaryData ? String(summaryData.pendingHostApprovals) : "--"}
          icon={<UserSquare className="h-4 w-4" />}
          className="sm:col-span-2 xl:col-span-1"
        />
        <StatCard
          label="Pending Withdrawals"
          value={summaryData ? String(summaryData.pendingWithdrawals) : "--"}
          icon={<Wallet className="h-4 w-4" />}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5" id="analytics">
        <div className="xl:col-span-3">
          {revenueSeries.isError && revenueData.length === 0 ? (
            <EmptyState
              title="Unable to load revenue trend"
              description="Dashboard analytics service is currently unavailable."
            />
          ) : !revenueSeries.isLoading && revenueData.length === 0 ? (
            <EmptyState
              title="No data available yet"
              description="Revenue analytics will appear once data is available."
            />
          ) : (
            <RevenueLineChart data={revenueData} />
          )}
        </div>
        <div className="xl:col-span-2">
          {topHosts.isError && topHostsData.length === 0 ? (
            <EmptyState
              title="Unable to load top hosts"
              description="Top host earnings data could not be fetched."
            />
          ) : !topHosts.isLoading && topHostsData.length === 0 ? (
            <EmptyState
              title="No data available yet"
              description="Top host earnings will appear after billed sessions are recorded."
            />
          ) : (
            <TopHostsBarChart data={topHostsData} />
          )}
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Add New Host</Button>
            <Link href="/host-kyc">
              <Button size="sm" variant="secondary">
                Approve Pending Hosts
              </Button>
            </Link>
            <Button size="sm" variant="secondary">
              Manage Pricing
            </Button>
            <Button size="sm" variant="secondary">
              Review Support Tickets
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-3">
          <CardTitle className="text-base">Recent Sessions</CardTitle>
          <SessionTable
            sessions={recentSessionData}
            loading={recentSessions.isLoading}
            emptyLabel={
              recentSessions.isError
                ? "Unable to load recent sessions."
                : "No data available yet."
            }
          />
        </Card>
        <Card className="space-y-3">
          <CardTitle className="text-base">Recent Recharges</CardTitle>
          {showRechargeUi ? (
            <DataTable
              data={recentRechargeData}
              loading={recentRecharges.isLoading}
              columns={rechargeColumns}
              emptyLabel={
                recentRecharges.isError
                  ? "Unable to load recent recharges."
                  : "No data available yet."
              }
            />
          ) : (
            <EmptyState
              title="Recharge disabled"
              description="Recharge operations are temporarily disabled in production."
            />
          )}
        </Card>
      </div>

      <Card className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-app-border p-4">
          <p className="text-xs text-app-text-muted">Wallet Recharge Today</p>
          {showRechargeUi ? (
            <p className="mt-2 text-2xl font-semibold">
              {summaryData ? formatInr(summaryData.rechargeToday) : "--"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-app-text-secondary">Coming soon</p>
          )}
        </div>
        <div className="rounded-2xl border border-app-border p-4">
          <p className="text-xs text-app-text-muted">Revenue Today</p>
          <p className="mt-2 text-2xl font-semibold">
            {summaryData ? formatInr(summaryData.revenueToday) : "--"}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-app-accent-bg px-2 py-1 text-xs text-app-accent">
            <Wallet className="h-3 w-3" />
            Wallet + Session billing synced
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
