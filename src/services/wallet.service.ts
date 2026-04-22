import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type {
  ApiResponse,
  PaginatedResponse,
  WalletOverview,
  WalletTransaction,
} from "@/types";

type BackendWalletRow = {
  id: string;
  userId: string;
  type?: string | null;
  status?: string | null;
  amount?: number | string | null;
  balanceBefore?: number | string | null;
  balanceAfter?: number | string | null;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
  user?: {
    id?: string;
    displayName?: string | null;
    phone?: string | null;
  } | null;
};

type BackendWalletPayload = {
  items?: BackendWalletRow[];
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

const mapTransactionType = (value?: string | null) => {
  const normalized = String(value ?? "").toUpperCase();
  const mapping: Record<string, WalletTransaction["type"]> = {
    RECHARGE: "recharge",
    CALL_DEBIT: "call_debit",
    CHAT_DEBIT: "chat_debit",
    REFERRAL_BONUS: "referral_bonus",
    REFUND: "refund",
    ADMIN_CREDIT: "admin_credit",
    ADMIN_DEBIT: "admin_debit",
    PROMO_CREDIT: "promo_credit",
    WITHDRAWAL_LOCK: "admin_debit",
    WITHDRAWAL_REFUND: "refund",
    WITHDRAWAL_PAYOUT: "admin_debit",
  };

  return mapping[normalized] || "promo_credit";
};

const mapTransactionStatus = (value?: string | null) => {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "PENDING") {
    return "pending" as const;
  }
  if (normalized === "FAILED") {
    return "failed" as const;
  }
  if (normalized === "REVERSED" || normalized === "REFUNDED") {
    return "refunded" as const;
  }
  return "success" as const;
};

const mapWalletRow = (item: BackendWalletRow): WalletTransaction => {
  const metadata =
    item.metadata && typeof item.metadata === "object" ? item.metadata : {};

  const paymentMethod = String(
    metadata.paymentMethod ||
      metadata.method ||
      metadata.provider ||
      "",
  ).trim();

  return {
    id: item.id,
    userName: item.user?.displayName || item.user?.phone || item.userId || "-",
    userId: item.user?.id || item.userId,
    type: mapTransactionType(item.type),
    amount: toNumber(item.amount, 0),
    status: mapTransactionStatus(item.status),
    balanceBefore: toNumber(item.balanceBefore, 0),
    balanceAfter: toNumber(item.balanceAfter, 0),
    paymentMethod: paymentMethod || undefined,
    createdAt: item.createdAt || new Date().toISOString(),
  };
};

const normalizeTransactionsPayload = (
  payload: BackendWalletPayload,
  requestedPage?: number,
  requestedPageSize?: number,
): PaginatedResponse<WalletTransaction> => {
  const items = (payload.items || []).map(mapWalletRow);
  return {
    items,
    page: Number(payload.pagination?.page ?? requestedPage ?? 1),
    pageSize: Number(payload.pagination?.limit ?? requestedPageSize ?? 10),
    totalCount: Number(payload.pagination?.total ?? items.length),
    totalPages: Number(payload.pagination?.totalPages ?? 1),
  };
};

export const walletService = {
  async getOverview() {
    const response = await api.get<ApiResponse<BackendWalletPayload>>(
      API_ENDPOINTS.wallet.overview,
      {
        params: {
          page: 1,
          limit: 200,
        },
      },
    );

    const rows = (response.data.data?.items || []).map(mapWalletRow);

    return rows.reduce<WalletOverview>(
      (acc, row) => {
        if (row.type === "recharge" && row.status === "success") {
          acc.totalRechargeVolume += row.amount;
          acc.successfulPayments += 1;
        }
        if (row.status === "pending") {
          acc.pendingPayments += 1;
        }
        if (row.status === "failed") {
          acc.failedPayments += 1;
        }
        if (row.status === "refunded" || row.type === "refund") {
          acc.refunds += 1;
        }
        if (row.type === "promo_credit" || row.type === "referral_bonus") {
          acc.couponUsage += 1;
        }
        return acc;
      },
      {
        totalRechargeVolume: 0,
        pendingPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refunds: 0,
        couponUsage: 0,
      },
    );
  },

  async getTransactions(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    search?: string;
  }) {
    const response = await api.get<ApiResponse<BackendWalletPayload>>(
      API_ENDPOINTS.wallet.transactions,
      {
        params: {
          ...params,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          limit: params?.pageSize ?? 10,
          type: params?.type?.toUpperCase(),
          status: params?.status?.toUpperCase(),
        },
      },
    );

    return normalizeTransactionsPayload(
      response.data.data || {},
      params?.page,
      params?.pageSize,
    );
  },

  async manualAdjustment(payload: {
    userId: string;
    type: "credit" | "debit";
    amount: number;
    reason: string;
  }) {
    const response = await api.post<ApiResponse<{ success: true }>>(
      API_ENDPOINTS.wallet.manualAdjustment,
      {
        userId: payload.userId,
        action: payload.type === "credit" ? "CREDIT" : "DEBIT",
        amount: payload.amount,
        reason: payload.reason,
      },
    );
    return response.data.data;
  },
};
