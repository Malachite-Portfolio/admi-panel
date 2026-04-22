import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type {
  ApiResponse,
  DashboardSummary,
  LiveSession,
  RevenuePoint,
  TopEarningHost,
  WalletTransaction,
} from "@/types";

export const dashboardService = {
  async summary() {
    const response = await api.get<ApiResponse<DashboardSummary>>(
      API_ENDPOINTS.dashboard.summary,
    );
    return response.data.data;
  },

  async revenueSeries() {
    const response = await api.get<ApiResponse<RevenuePoint[]>>(
      API_ENDPOINTS.dashboard.revenueSeries,
    );
    return response.data.data;
  },

  async topEarningHosts() {
    const response = await api.get<ApiResponse<TopEarningHost[]>>(
      API_ENDPOINTS.dashboard.topHosts,
    );
    return response.data.data;
  },

  async recentSessions() {
    const response = await api.get<ApiResponse<LiveSession[]>>(
      API_ENDPOINTS.dashboard.recentSessions,
    );
    return response.data.data;
  },

  async recentRecharges() {
    const response = await api.get<ApiResponse<WalletTransaction[]>>(
      API_ENDPOINTS.dashboard.recentRecharges,
    );
    return response.data.data;
  },
};
