"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/auth-provider";
import { authService } from "@/services/auth.service";
import type { LoginPayload } from "@/types";

export function useAuth() {
  const router = useRouter();
  const auth = useAuthContext();

  const extractErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      const responsePayload = error.response?.data as
        | { message?: string; error?: { message?: string } }
        | undefined;
      const responseMessage = responsePayload?.message || responsePayload?.error?.message;
      if (responseMessage) {
        return responseMessage;
      }

      if (!error.response) {
        return "Unable to connect to server. Please check configuration.";
      }

      if (error.code === "ECONNABORTED") {
        return "Login request timed out. Please try again.";
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Login failed. Please check your credentials.";
  };

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      auth.login(session);
      toast.success("Welcome back. Signed in successfully.");
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  const meQuery = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => authService.me(),
    enabled: !!auth.session?.accessToken,
    staleTime: 30_000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!auth.session?.refreshToken) {
        return;
      }
      await authService.logout(auth.session.refreshToken);
    },
    onSettled: () => {
      auth.logout();
      router.replace("/login");
    },
  });

  return {
    session: auth.session,
    isHydrated: auth.isHydrated,
    me: meQuery.data,
    isMeLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
