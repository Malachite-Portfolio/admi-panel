"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { dashboardService } from "@/services/dashboard.service";
import type {
  DashboardSummary,
  LiveSession,
  RevenuePoint,
  TopEarningHost,
  WalletTransaction,
} from "@/types";

const EMPTY_SUMMARY: DashboardSummary = {
  totalUsers: 0,
  totalHosts: 0,
  activeHosts: 0,
  liveCalls: 0,
  liveChats: 0,
  rechargeToday: 0,
  revenueToday: 0,
  pendingHostApprovals: 0,
  pendingWithdrawals: 0,
};

const EMPTY_REVENUE_SERIES: RevenuePoint[] = [];
const EMPTY_TOP_HOSTS: TopEarningHost[] = [];
const EMPTY_RECENT_SESSIONS: LiveSession[] = [];
const EMPTY_RECENT_RECHARGES: WalletTransaction[] = [];

const shouldRetryDashboardQuery = (failureCount: number, error: Error) => {
  if (error instanceof AxiosError && error.response?.status === 404) {
    return false;
  }

  return failureCount < 1;
};

const DASHBOARD_QUERY_OPTIONS = {
  staleTime: 30_000,
  initialDataUpdatedAt: 0,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: shouldRetryDashboardQuery,
} as const;

export function useDashboardData() {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardService.summary,
    initialData: EMPTY_SUMMARY,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const revenueSeries = useQuery({
    queryKey: ["dashboard-revenue-series"],
    queryFn: dashboardService.revenueSeries,
    initialData: EMPTY_REVENUE_SERIES,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const topHosts = useQuery({
    queryKey: ["dashboard-top-hosts"],
    queryFn: dashboardService.topEarningHosts,
    initialData: EMPTY_TOP_HOSTS,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const recentSessions = useQuery({
    queryKey: ["dashboard-recent-sessions"],
    queryFn: dashboardService.recentSessions,
    initialData: EMPTY_RECENT_SESSIONS,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const recentRecharges = useQuery({
    queryKey: ["dashboard-recent-recharges"],
    queryFn: dashboardService.recentRecharges,
    initialData: EMPTY_RECENT_RECHARGES,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  return {
    summary,
    revenueSeries,
    topHosts,
    recentSessions,
    recentRecharges,
  };
}
