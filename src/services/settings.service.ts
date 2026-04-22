import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, AppSettings } from "@/types";

export const settingsService = {
  async getSettings() {
    const response = await api.get<ApiResponse<AppSettings>>(API_ENDPOINTS.settings.base);
    return response.data.data;
  },

  async updateSettings(settings: Partial<AppSettings>) {
    const response = await api.patch<ApiResponse<AppSettings>>(
      API_ENDPOINTS.settings.base,
      settings,
    );
    return response.data.data;
  },
};
