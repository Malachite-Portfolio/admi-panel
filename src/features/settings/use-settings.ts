"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsService } from "@/services/settings.service";
import type { AppSettings } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: settingsService.getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<AppSettings>) => settingsService.updateSettings(input),
    onSuccess: () => {
      toast.success("Settings updated");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => toast.error("Failed to update settings"),
  });
}
