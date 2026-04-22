"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersService } from "@/services/users.service";

export function useUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => usersService.getUsers(params),
  });
}

export function useWalletAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      userId: string;
      type: "credit" | "debit";
      amount: number;
      reason: string;
    }) =>
      input.type === "credit"
        ? usersService.creditWallet(input.userId, input.amount, input.reason)
        : usersService.debitWallet(input.userId, input.amount, input.reason),
    onSuccess: () => {
      toast.success("Wallet adjusted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Wallet adjustment failed");
    },
  });
}
