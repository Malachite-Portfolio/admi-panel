import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, PaginatedResponse, ReferralRecord, ReferralSettings } from "@/types";

export const referralsService = {
  async getReferrals(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }) {
    const response = await api.get<ApiResponse<PaginatedResponse<ReferralRecord>>>(
      API_ENDPOINTS.referrals.list,
      { params },
    );
    return response.data.data;
  },

  async updateReferralSettings(settings: Partial<ReferralSettings>) {
    const response = await api.patch<ApiResponse<ReferralSettings>>(
      API_ENDPOINTS.referrals.settings,
      settings,
    );
    return response.data.data;
  },
};
