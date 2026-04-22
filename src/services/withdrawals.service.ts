import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type {
  AdminWithdrawal,
  AdminWithdrawalListResponse,
  ApiResponse,
  UpdateWithdrawalStatusPayload,
  WithdrawalStatusUpdateResult,
} from "@/types";

type BackendPagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type BackendWithdrawalListPayload = {
  items?: AdminWithdrawal[];
  pagination?: BackendPagination;
};

const normalizeWithdrawalList = (
  payload: BackendWithdrawalListPayload,
): AdminWithdrawalListResponse => {
  const pagination = payload.pagination ?? {};
  const items = payload.items ?? [];
  const page = Number(pagination.page ?? 1);
  const limit = Number(pagination.limit ?? 20);
  const total = Number(pagination.total ?? items.length);
  const totalPages = Number(pagination.totalPages ?? Math.max(1, Math.ceil(total / limit)));

  return {
    items,
    page,
    limit,
    total,
    totalPages,
  };
};

export const withdrawalsService = {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    listenerId?: string;
  }) {
    const response = await api.get<ApiResponse<BackendWithdrawalListPayload>>(
      API_ENDPOINTS.withdrawals.list,
      { params },
    );
    return normalizeWithdrawalList(response.data.data);
  },

  async getById(withdrawalId: string) {
    const response = await api.get<ApiResponse<AdminWithdrawal>>(
      API_ENDPOINTS.withdrawals.byId(withdrawalId),
    );
    return response.data.data;
  },

  async updateStatus(
    withdrawalId: string,
    payload: UpdateWithdrawalStatusPayload,
  ) {
    const response = await api.patch<ApiResponse<WithdrawalStatusUpdateResult>>(
      API_ENDPOINTS.withdrawals.updateStatus(withdrawalId),
      payload,
    );
    return response.data.data;
  },

  async updateNote(withdrawalId: string, adminNote: string) {
    const response = await api.patch<ApiResponse<AdminWithdrawal>>(
      API_ENDPOINTS.withdrawals.updateNote(withdrawalId),
      { adminNote },
    );
    return response.data.data;
  },

  async updateReference(withdrawalId: string, transactionReference: string) {
    const response = await api.patch<ApiResponse<AdminWithdrawal>>(
      API_ENDPOINTS.withdrawals.updateReference(withdrawalId),
      { transactionReference },
    );
    return response.data.data;
  },
};
