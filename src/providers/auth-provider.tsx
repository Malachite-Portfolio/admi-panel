"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_COOKIE_KEY, AUTH_STORAGE_KEY } from "@/constants/app";
import type { AuthSession } from "@/types";
import { connectAdminSocket, disconnectAdminSocket } from "@/services/socket";

type AuthContextType = {
  session: AuthSession | null;
  isHydrated: boolean;
  login: (nextSession: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function setAuthCookie(token: string) {
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=2592000; samesite=lax`;
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = readStoredSession();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(saved);
      setAuthCookie(saved.accessToken);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      connectAdminSocket(session.accessToken);
      return;
    }

    disconnectAdminSocket();
  }, [session?.accessToken]);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      isHydrated,
      login(nextSession) {
        setSession(nextSession);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        setAuthCookie(nextSession.accessToken);
      },
      logout() {
        setSession(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        clearAuthCookie();
      },
    }),
    [isHydrated, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
