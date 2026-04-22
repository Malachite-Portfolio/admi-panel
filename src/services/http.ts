import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_CONFIG_ERROR, API_ENDPOINTS } from "@/constants/api";
import { clearStoredAuthSession, getStoredAuthSession, setStoredAuthSession } from "@/features/auth/storage";
import type { ApiResponse, AuthSession } from "@/types";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_DEBUG_ENABLED = process.env.NODE_ENV !== "production";

function sanitizeAuthDebugValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeAuthDebugValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => {
        if (["accessToken", "refreshToken", "token"].includes(key)) {
          return [key, "[REDACTED]"];
        }
        return [key, sanitizeAuthDebugValue(nestedValue)];
      }),
    );
  }

  return value;
}

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 12_000,
});

let hasLoggedApiConfigError = false;

api.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    if (!hasLoggedApiConfigError) {
      console.error(API_CONFIG_ERROR || "API base URL is not configured");
      hasLoggedApiConfigError = true;
    }
    return Promise.reject(new Error(API_CONFIG_ERROR));
  }

  const session = getStoredAuthSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queuedRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error?: unknown, token?: string) {
  queuedRequests.forEach((request) => {
    if (error) {
      request.reject(error);
      return;
    }
    request.resolve(token ?? "");
  });

  queuedRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const session = getStoredAuthSession();
    if (!session?.refreshToken) {
      clearStoredAuthSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedRequests.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      if (AUTH_DEBUG_ENABLED) {
        console.debug("[AdminAuth] refresh request", {
          url: `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
          payloadKeys: ["refreshToken"],
        });
      }

      const response = await axios.post<ApiResponse<Partial<AuthSession>>>(
        `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
        {
          refreshToken: session.refreshToken,
        },
      );

      if (AUTH_DEBUG_ENABLED) {
        console.debug("[AdminAuth] refresh response", {
          status: response.status,
          body: sanitizeAuthDebugValue(response.data),
        });
      }

      const nextSession = {
        ...session,
        ...response.data.data,
        accessToken: String(response.data.data.accessToken ?? session.accessToken),
      } as AuthSession;

      setStoredAuthSession(nextSession);
      flushQueue(undefined, nextSession.accessToken);
      original.headers.Authorization = `Bearer ${nextSession.accessToken}`;

      return api(original);
    } catch (refreshError) {
      if (AUTH_DEBUG_ENABLED) {
        const typedError = refreshError as {
          response?: { status?: number; data?: unknown };
          message?: string;
        };

        console.warn("[AdminAuth] refresh error", {
          url: `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
          payloadKeys: ["refreshToken"],
          status: typedError.response?.status ?? null,
          body: sanitizeAuthDebugValue(typedError.response?.data),
          message: typedError.message || "Unknown error",
        });
      }
      clearStoredAuthSession();
      flushQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
