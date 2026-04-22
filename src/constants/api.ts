const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizeApiBaseUrl = (rawValue?: string) => {
  const value = rawValue?.trim();
  if (!value) {
    return "";
  }

  const trimmed = trimTrailingSlash(value);
  if (/\/api\/v\d+$/i.test(trimmed)) {
    return trimmed;
  }

  if (/\/api$/i.test(trimmed)) {
    return `${trimmed}/v1`;
  }

  return trimmed;
};

const buildSocketBaseUrl = (rawSocketUrl?: string, apiBaseUrl?: string) => {
  const socketUrl = rawSocketUrl?.trim();
  if (socketUrl) {
    return trimTrailingSlash(socketUrl);
  }

  if (!apiBaseUrl) {
    return "";
  }

  return apiBaseUrl.replace(/\/api(?:\/v\d+)?$/i, "");
};

const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

export const API_CONFIG_ERROR = API_BASE_URL
  ? ""
  : "Admin API is not configured. Set NEXT_PUBLIC_API_BASE_URL in environment variables.";

export const SOCKET_BASE_URL = buildSocketBaseUrl(
  process.env.NEXT_PUBLIC_SOCKET_URL,
  API_BASE_URL,
);

export const SOCKET_CONFIG_WARNING = SOCKET_BASE_URL
  ? ""
  : "Socket base URL is not configured. Set NEXT_PUBLIC_SOCKET_URL for realtime admin sync.";

export const API_ENDPOINTS = {
  auth: {
    login: "/admin/auth/login",
    refresh: "/admin/auth/refresh",
    logout: "/admin/auth/logout",
    me: "/admin/auth/me",
  },
  app: {
    sidebar: "/admin/app/sidebar",
  },
  dashboard: {
    summary: "/admin/dashboard/summary",
    revenueSeries: "/admin/dashboard/revenue-series",
    topHosts: "/admin/dashboard/top-hosts",
    recentSessions: "/admin/dashboard/recent-sessions",
    recentRecharges: "/admin/dashboard/recent-recharges",
  },
  hosts: {
    base: "/admin/listeners",
    pending: "/admin/listeners/pending",
    bulkAction: "/admin/listeners/bulk-action",
    byId: (hostId: string) => `/admin/listeners/${hostId}`,
    approve: (hostId: string) => `/admin/listeners/${hostId}/approve`,
    reject: (hostId: string) => `/admin/listeners/${hostId}/reject`,
    action: (hostId: string, action: string) => `/admin/listeners/${hostId}/${action}`,
    sessions: (hostId: string) => `/admin/listeners/${hostId}/sessions`,
    pricingHistory: (hostId: string) => `/admin/listeners/${hostId}/pricing-history`,
  },
  kyc: {
    list: "/admin/kyc",
    byId: (kycId: string) => `/admin/kyc/${kycId}`,
    review: (kycId: string) => `/admin/kyc/${kycId}/review`,
  },
  referrals: {
    list: "/admin/referrals",
    settings: "/admin/referral-settings",
  },
  sessions: {
    live: "/admin/sessions/call",
    calls: "/admin/sessions/call",
    chats: "/admin/sessions/chat",
    forceEnd: (sessionId: string) => `/admin/sessions/${sessionId}/end`,
  },
  settings: {
    base: "/admin/settings",
  },
  support: {
    tickets: "/admin/support/tickets",
    byId: (ticketId: string) => `/admin/support/tickets/${ticketId}`,
  },
  users: {
    base: "/admin/users",
  },
  wallet: {
    overview: "/admin/wallet/ledger",
    transactions: "/admin/wallet/ledger",
    manualAdjustment: "/admin/wallet/adjust",
  },
  withdrawals: {
    list: "/admin/withdrawals",
    byId: (withdrawalId: string) => `/admin/withdrawals/${withdrawalId}`,
    updateStatus: (withdrawalId: string) =>
      `/admin/withdrawal/${withdrawalId}/status`,
    updateNote: (withdrawalId: string) =>
      `/admin/withdrawal/${withdrawalId}/note`,
    updateReference: (withdrawalId: string) =>
      `/admin/withdrawal/${withdrawalId}/reference`,
  },
} as const;
