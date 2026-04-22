import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type { ApiResponse, AuthSession, LoginPayload } from "@/types";
import type { AdminRole } from "@/types";

const AUTH_DEBUG_ENABLED = process.env.NODE_ENV !== "production";

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

  return {
    accessToken: String(rawData.accessToken ?? rawData.token ?? ""),
    refreshToken: String(rawData.refreshToken ?? ""),
    role: normalizeRole(String(rawData.role ?? user.role ?? "admin")),
    adminId: String(user.id ?? rawData.adminId ?? "admin-local"),
    name: String(user.displayName ?? user.name ?? "Admin"),
    email: String(user.email ?? fallbackLoginId),
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const emailOrPhone = payload.emailOrPhone.trim();
    const password = payload.password;
    const requestBody = {
      phoneOrEmail: emailOrPhone,
      password,
    };

    logAuthRequest("login", API_ENDPOINTS.auth.login, requestBody);

    try {
      const response = await api.post<ApiResponse<Record<string, unknown>>>(
        API_ENDPOINTS.auth.login,
        requestBody,
      );
      logAuthResponse("login", response);

      return mapSessionResponse(response.data.data, emailOrPhone);
    } catch (error) {
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
