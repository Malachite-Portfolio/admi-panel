import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, PaginatedResponse, User } from "@/types";

type BackendUserRecord = {
  id: string;
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
  createdAt?: string;
  referralCode?: string | null;
  totalRecharge?: number | string | null;
  totalSpent?: number | string | null;
  wallet?: {
    balance?: number | string | null;
  } | null;
};

type BackendUsersPayload = {
  items?: BackendUserRecord[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapUserStatus = (status?: string | null) => {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "BLOCKED") {
    return "suspended" as const;
  }
  if (normalized === "DELETED") {
    return "blocked" as const;
  }
  return "active" as const;
};

const normalizeStatusFilter = (status?: string) => {
  if (!status) {
    return undefined;
  }

  const normalized = status.trim().toUpperCase();
  if (!normalized) {
    return undefined;
  }

  if (normalized === "INACTIVE" || normalized === "SUSPENDED") {
    return "BLOCKED";
  }

  if (normalized === "ACTIVE" || normalized === "BLOCKED" || normalized === "DELETED") {
    return normalized;
  }

  return undefined;
};

const mapBackendUser = (item: BackendUserRecord): User => ({
  id: item.id,
  name: item.displayName || item.phone || item.id,
  phone: item.phone || "-",
  email: item.email || undefined,
  referralCode: item.referralCode || "-",
  walletBalance: toNumber(item.wallet?.balance, 0),
  totalRecharge: toNumber(item.totalRecharge, 0),
  totalSpent: toNumber(item.totalSpent, 0),
  status: mapUserStatus(item.status),
  joinedAt: item.createdAt || "",
});

export const usersService = {
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) {
    const response = await api.get<ApiResponse<BackendUsersPayload>>(
      API_ENDPOINTS.users.base,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          limit: params?.pageSize ?? 10,
          search: params?.search || undefined,
          status: normalizeStatusFilter(params?.status),
        },
      },
    );

    const payload = response.data.data || {};
    const items = (payload.items || []).map(mapBackendUser);

    return {
      items,
      page: Number(payload.pagination?.page ?? params?.page ?? 1),
      pageSize: Number(payload.pagination?.limit ?? params?.pageSize ?? 10),
      totalCount: Number(payload.pagination?.total ?? items.length),
      totalPages: Number(payload.pagination?.totalPages ?? 1),
    } satisfies PaginatedResponse<User>;
  },

  async getUserById(userId: string) {
    const list = await this.getUsers({ page: 1, pageSize: 100 });
    const user = list.items.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  async creditWallet(userId: string, amount: number, reason: string) {
    const response = await api.post<ApiResponse<{ success: true }>>(
      API_ENDPOINTS.wallet.manualAdjustment,
      { userId, action: "CREDIT", amount, reason },
    );
    return response.data.data;
  },

  async debitWallet(userId: string, amount: number, reason: string) {
    const response = await api.post<ApiResponse<{ success: true }>>(
      API_ENDPOINTS.wallet.manualAdjustment,
      { userId, action: "DEBIT", amount, reason },
    );
    return response.data.data;
  },

  async suspendUser(userId: string, reason: string) {
    void userId;
    void reason;
    throw new Error("Suspend user endpoint is not available in current backend API.");
  },
};
