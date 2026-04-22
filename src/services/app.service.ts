import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, SidebarData } from "@/types";

export const appService = {
  async getSidebarData() {
    const response = await api.get<ApiResponse<SidebarData>>(API_ENDPOINTS.app.sidebar);
    return response.data.data;
  },
};
