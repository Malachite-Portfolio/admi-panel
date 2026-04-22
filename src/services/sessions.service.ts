import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, LiveSession, PaginatedResponse } from "@/types";

type BackendSessionUser = {
  id?: string;
  displayName?: string | null;
  phone?: string | null;
};

type BackendCallSession = {
  id: string;
  user?: BackendSessionUser | null;
  listener?: BackendSessionUser | null;
  status?: string | null;
  requestedAt?: string;
  startedAt?: string | null;
  answeredAt?: string | null;
  endedAt?: string | null;
  totalAmount?: number | string | null;
  endReason?: string | null;
};

type BackendChatSession = {
  id: string;
  user?: BackendSessionUser | null;
  listener?: BackendSessionUser | null;
  status?: string | null;
  requestedAt?: string;
  startedAt?: string | null;
  endedAt?: string | null;
  totalAmount?: number | string | null;
  endReason?: string | null;
};

type BackendSessionPayload<T> = {
  items?: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

const ACTIVE_STATUSES = new Set(["active", "ringing"]);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapSessionStatus = (status?: string | null, endReason?: string | null) => {
  const normalizedStatus = String(status ?? "").toUpperCase();
  const normalizedReason = String(endReason ?? "").toUpperCase();

  if (normalizedStatus === "ACTIVE") {
    return "active" as const;
  }

  if (normalizedStatus === "RINGING" || normalizedStatus === "REQUESTED") {
    return "ringing" as const;
  }

  if (
    normalizedStatus === "CANCELLED" ||
    normalizedStatus === "REJECTED" ||
    normalizedStatus === "MISSED"
  ) {
    return "cancelled" as const;
  }

  if (normalizedReason === "INSUFFICIENT_BALANCE") {
    return "insufficient_balance" as const;
  }

  return "ended" as const;
};

const resolveStartTime = (
  requestedAt?: string,
  startedAt?: string | null,
  answeredAt?: string | null,
) => startedAt || answeredAt || requestedAt || new Date().toISOString();

const computeDurationSeconds = (
  startTime: string,
  endTime?: string | null,
) => {
  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime || new Date().toISOString()).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return 0;
  }
  return Math.floor((endMs - startMs) / 1000);
};

const mapCallSession = (item: BackendCallSession): LiveSession => {
  const startTime = resolveStartTime(item.requestedAt, item.startedAt, item.answeredAt);
  return {
    id: item.id,
    type: "call",
    userName: item.user?.displayName || item.user?.phone || item.user?.id || "-",
    hostName: item.listener?.displayName || item.listener?.phone || item.listener?.id || "-",
    startTime,
    runningDurationSeconds: computeDurationSeconds(startTime, item.endedAt),
    currentBilling: toNumber(item.totalAmount, 0),
    status: mapSessionStatus(item.status, item.endReason),
  };
};

const mapChatSession = (item: BackendChatSession): LiveSession => {
  const startTime = resolveStartTime(item.requestedAt, item.startedAt, undefined);
  return {
    id: item.id,
    type: "chat",
    userName: item.user?.displayName || item.user?.phone || item.user?.id || "-",
    hostName: item.listener?.displayName || item.listener?.phone || item.listener?.id || "-",
    startTime,
    runningDurationSeconds: computeDurationSeconds(startTime, item.endedAt),
    currentBilling: toNumber(item.totalAmount, 0),
    status: mapSessionStatus(item.status, item.endReason),
  };
};

const normalizePaginatedSessions = (
  payload: BackendSessionPayload<BackendCallSession | BackendChatSession>,
  mappedItems: LiveSession[],
  requestedPage?: number,
  requestedPageSize?: number,
): PaginatedResponse<LiveSession> => ({
  items: mappedItems,
  page: Number(payload.pagination?.page ?? requestedPage ?? 1),
  pageSize: Number(payload.pagination?.limit ?? requestedPageSize ?? 10),
  totalCount: Number(payload.pagination?.total ?? mappedItems.length),
  totalPages: Number(payload.pagination?.totalPages ?? 1),
});

export const sessionsService = {
  async getLiveSessions() {
    const [callsResponse, chatsResponse] = await Promise.all([
      api.get<ApiResponse<BackendSessionPayload<BackendCallSession>>>(
        API_ENDPOINTS.sessions.calls,
        { params: { page: 1, limit: 50 } },
      ),
      api.get<ApiResponse<BackendSessionPayload<BackendChatSession>>>(
        API_ENDPOINTS.sessions.chats,
        { params: { page: 1, limit: 50 } },
      ),
    ]);

    const callSessions = (callsResponse.data.data?.items || []).map(mapCallSession);
    const chatSessions = (chatsResponse.data.data?.items || []).map(mapChatSession);

    return [...callSessions, ...chatSessions]
      .filter((session) => ACTIVE_STATUSES.has(session.status))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  async getCallSessions(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const response = await api.get<ApiResponse<BackendSessionPayload<BackendCallSession>>>(
      API_ENDPOINTS.sessions.calls,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          limit: params?.pageSize ?? 10,
        },
      },
    );

    const payload = response.data.data || {};
    const mapped = (payload.items || []).map(mapCallSession);
    const filtered = params?.status
      ? mapped.filter((item) => item.status === params.status)
      : mapped;

    return normalizePaginatedSessions(payload, filtered, params?.page, params?.pageSize);
  },

  async getChatSessions(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const response = await api.get<ApiResponse<BackendSessionPayload<BackendChatSession>>>(
      API_ENDPOINTS.sessions.chats,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          limit: params?.pageSize ?? 10,
        },
      },
    );

    const payload = response.data.data || {};
    const mapped = (payload.items || []).map(mapChatSession);
    const filtered = params?.status
      ? mapped.filter((item) => item.status === params.status)
      : mapped;

    return normalizePaginatedSessions(payload, filtered, params?.page, params?.pageSize);
  },

  async forceEndSession(sessionId: string, reason: string) {
    const response = await api.post<ApiResponse<{ success: true }>>(
      API_ENDPOINTS.sessions.forceEnd(sessionId),
      { reason },
    );
    return response.data.data;
  },
};
