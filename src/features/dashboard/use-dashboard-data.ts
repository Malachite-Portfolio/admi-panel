"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

const DASHBOARD_QUERY_OPTIONS = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
} as const;

export function useDashboardData() {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardService.summary,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const revenueSeries = useQuery({
    queryKey: ["dashboard-revenue-series"],
    queryFn: dashboardService.revenueSeries,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const topHosts = useQuery({
    queryKey: ["dashboard-top-hosts"],
    queryFn: dashboardService.topEarningHosts,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const recentSessions = useQuery({
    queryKey: ["dashboard-recent-sessions"],
    queryFn: dashboardService.recentSessions,
    ...DASHBOARD_QUERY_OPTIONS,
  });

  const recentRecharges = useQuery({
    queryKey: ["dashboard-recent-recharges"],
    queryFn: dashboardService.recentRecharges,
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
