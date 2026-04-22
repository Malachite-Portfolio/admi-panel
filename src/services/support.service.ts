import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, PaginatedResponse, SupportTicket } from "@/types";

type BackendSupportTicket = {
  id: string;
  userName?: string;
  hostName?: string;
  subject?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
};

type BackendSupportPayload = {
  items?: BackendSupportTicket[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

const normalizeStatus = (value?: string): SupportTicket["status"] => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "in_progress" || normalized === "resolved" || normalized === "closed") {
    return normalized;
  }
  return "open";
};

const normalizePriority = (value?: string): SupportTicket["priority"] => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return "high";
};

const mapTicket = (item: BackendSupportTicket): SupportTicket => ({
  id: item.id,
  userName: item.userName || "Unknown user",
  hostName: item.hostName || undefined,
  subject: item.subject || "Support request",
  priority: normalizePriority(item.priority),
  status: normalizeStatus(item.status),
  createdAt: item.createdAt || new Date().toISOString(),
});

export const supportService = {
  async getTickets(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    const response = await api.get<ApiResponse<BackendSupportPayload>>(
      API_ENDPOINTS.support.tickets,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          limit: params?.pageSize ?? 10,
          status: params?.status ? params.status.toUpperCase() : undefined,
          priority: params?.priority ? params.priority.toUpperCase() : undefined,
          search: params?.search || undefined,
        },
      },
    );

    const payload = response.data.data || {};
    const items = (payload.items || []).map(mapTicket);
    return {
      items,
      page: Number(payload.pagination?.page ?? params?.page ?? 1),
      pageSize: Number(payload.pagination?.limit ?? params?.pageSize ?? 10),
      totalCount: Number(payload.pagination?.total ?? items.length),
      totalPages: Number(payload.pagination?.totalPages ?? 1),
    } satisfies PaginatedResponse<SupportTicket>;
  },

  async updateTicket(
    ticketId: string,
    payload: {
      status?: SupportTicket["status"];
      priority?: SupportTicket["priority"];
      assignedTo?: string;
      reply?: string;
    },
  ) {
    const response = await api.patch<ApiResponse<BackendSupportTicket>>(
      API_ENDPOINTS.support.byId(ticketId),
      {
        ...payload,
        status: payload.status?.toUpperCase(),
        priority: payload.priority?.toUpperCase(),
      },
    );
    return mapTicket(response.data.data || { id: ticketId });
  },
};
