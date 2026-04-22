import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, AuthSession, LoginPayload } from "@/types";
import type { AdminRole } from "@/types";

const AUTH_DEBUG_ENABLED = process.env.NODE_ENV !== "production";
const LEGACY_LOGIN_FIELD_RETRY_ENABLED =
  process.env.NEXT_PUBLIC_ADMIN_LEGACY_LOGIN_FIELD_RETRY !== "false";

function sanitizeAuthDebugValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeAuthDebugValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => {
        if (
          ["accessToken", "refreshToken", "token", "password", "otp"].includes(key)
        ) {
          return [key, "[REDACTED]"];
        }
        return [key, sanitizeAuthDebugValue(nestedValue)];
      }),
    );
  }

  return value;
}

function logAuthRequest(label: string, path: string, payload?: Record<string, unknown>) {
  if (!AUTH_DEBUG_ENABLED) {
    return;
  }

  console.debug(`[AdminAuth] ${label} request`, {
    url: `${API_BASE_URL}${path}`,
    payloadKeys: Object.keys(payload || {}),
  });
}

function logAuthResponse(label: string, response: { status: number; data: unknown }) {
  if (!AUTH_DEBUG_ENABLED) {
    return;
  }

  console.debug(`[AdminAuth] ${label} response`, {
    status: response.status,
    body: sanitizeAuthDebugValue(response.data),
  });
}

function logAuthError(
  label: string,
  path: string,
  payload: Record<string, unknown> | undefined,
  error: unknown,
) {
  if (!AUTH_DEBUG_ENABLED) {
    return;
  }

  const typedError = error as {
    response?: { status?: number; data?: unknown };
    message?: string;
  };

  console.warn(`[AdminAuth] ${label} error`, {
    url: `${API_BASE_URL}${path}`,
    payloadKeys: Object.keys(payload || {}),
    status: typedError.response?.status ?? null,
    body: sanitizeAuthDebugValue(typedError.response?.data),
    message: typedError.message || "Unknown error",
  });
}

function normalizeRole(value?: string): AdminRole {
  const normalized = String(value ?? "admin").toLowerCase();
  if (normalized === "super_admin" || normalized === "superadmin") {
    return "super_admin";
  }
  if (normalized === "support_manager" || normalized === "supportmanager") {
    return "support_manager";
  }
  return "admin";
}

function mapSessionResponse(rawData: Record<string, unknown>, fallbackLoginId: string): AuthSession {
  const user = (rawData.user as Record<string, unknown> | undefined) ?? rawData;
  const accessToken = String(rawData.accessToken ?? rawData.token ?? "");
  const refreshToken = String(rawData.refreshToken ?? "");

  if (!accessToken) {
    throw new Error("Admin login response did not include an access token.");
  }

  return {
    accessToken,
    refreshToken,
    role: normalizeRole(String(rawData.role ?? user.role ?? "admin")),
    adminId: String(user.id ?? rawData.adminId ?? "admin-local"),
    name: String(user.displayName ?? user.name ?? "Admin"),
    email: String(user.email ?? fallbackLoginId),
  };
}

function unwrapAuthData(payload: ApiResponse<Record<string, unknown>> | Record<string, unknown>) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return ((payload as ApiResponse<Record<string, unknown>>).data ?? {}) as Record<
      string,
      unknown
    >;
  }

  return payload as Record<string, unknown>;
}

function isLoginPayloadRejected(error: unknown) {
  const typedError = error as {
    response?: {
      status?: number;
    };
  };

  return typedError.response?.status === 400 || typedError.response?.status === 422;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const loginId = payload.loginId.trim();
    const password = payload.password;
    const requestBody = {
      loginId,
      password,
    };

    logAuthRequest("login", API_ENDPOINTS.auth.login, requestBody);

    try {
      const response = await api.post<ApiResponse<Record<string, unknown>>>(
        API_ENDPOINTS.auth.login,
        requestBody,
      );
      logAuthResponse("login", response);

      return mapSessionResponse(unwrapAuthData(response.data), loginId);
    } catch (error) {
      if (LEGACY_LOGIN_FIELD_RETRY_ENABLED && isLoginPayloadRejected(error)) {
        const legacyRequestBody = {
          phoneOrEmail: loginId,
          password,
        };

        logAuthRequest("login legacy field retry", API_ENDPOINTS.auth.login, legacyRequestBody);

        try {
          const response = await api.post<ApiResponse<Record<string, unknown>>>(
            API_ENDPOINTS.auth.login,
            legacyRequestBody,
          );
          logAuthResponse("login legacy field retry", response);

          return mapSessionResponse(unwrapAuthData(response.data), loginId);
        } catch (legacyError) {
          logAuthError(
            "login legacy field retry",
            API_ENDPOINTS.auth.login,
            legacyRequestBody,
            legacyError,
          );
          throw legacyError;
        }
      }

      logAuthError("login", API_ENDPOINTS.auth.login, requestBody, error);
      throw error;
    }
  },

  async me(): Promise<{
    id: string;
    name: string;
    email: string;
    role: AdminRole;
  }> {
    logAuthRequest("me", API_ENDPOINTS.auth.me);
    try {
      const response = await api.get<ApiResponse<Record<string, unknown>>>(
        API_ENDPOINTS.auth.me,
      );
      logAuthResponse("me", response);
      const user = response.data.data;
      return {
        id: String(user.id ?? ""),
        name: String(user.displayName ?? user.name ?? "Admin"),
        email: String(user.email ?? ""),
        role: normalizeRole(String(user.role ?? "admin")),
      };
    } catch (error) {
      logAuthError("me", API_ENDPOINTS.auth.me, undefined, error);
      throw error;
    }
  },

  async logout(refreshToken: string) {
    const requestBody = { refreshToken };
    logAuthRequest("logout", API_ENDPOINTS.auth.logout, requestBody);
    try {
      const response = await api.post<ApiResponse<{ revoked: boolean }>>(
        API_ENDPOINTS.auth.logout,
        requestBody,
      );
      logAuthResponse("logout", response);
    } catch (error) {
      logAuthError("logout", API_ENDPOINTS.auth.logout, requestBody, error);
      throw error;
    }
  },
};
