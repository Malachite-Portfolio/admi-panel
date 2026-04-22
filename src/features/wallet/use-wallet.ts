"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletService } from "@/services/wallet.service";

export function useWalletOverview() {
  return useQuery({
    queryKey: ["admin-wallet-overview"],
    queryFn: walletService.getOverview,
  });
}

export function useWalletTransactions(params: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-wallet-transactions", params],
    queryFn: () => walletService.getTransactions(params),
  });
}

export function useManualWalletAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletService.manualAdjustment,
    onSuccess: () => {
      toast.success("Wallet adjustment recorded");
      queryClient.invalidateQueries({ queryKey: ["admin-wallet-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-wallet-transactions"] });
    },
    onError: () => toast.error("Failed to record wallet adjustment"),
  });
}
