"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { withdrawalsService } from "@/services/withdrawals.service";
import type {
  UpdateWithdrawalStatusPayload,
  WithdrawalSummaryCounts,
} from "@/types";

const WITHDRAWAL_LIST_KEY = "admin-withdrawals-list";
const WITHDRAWAL_DETAIL_KEY = "admin-withdrawal-detail";
const WITHDRAWAL_SUMMARY_KEY = "admin-withdrawal-summary";

export function useAdminWithdrawals(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: [WITHDRAWAL_LIST_KEY, params],
    queryFn: () => withdrawalsService.list(params),
  });
}

export function useWithdrawalSummary() {
  return useQuery({
    queryKey: [WITHDRAWAL_SUMMARY_KEY],
    queryFn: async (): Promise<WithdrawalSummaryCounts> => {
      const [pending, approved, inProgress, paymentDone, rejected] =
        await Promise.all([
          withdrawalsService.list({ page: 1, limit: 1, status: "PENDING" }),
          withdrawalsService.list({ page: 1, limit: 1, status: "APPROVED" }),
          withdrawalsService.list({ page: 1, limit: 1, status: "IN_PROGRESS" }),
          withdrawalsService.list({ page: 1, limit: 1, status: "PAYMENT_DONE" }),
          withdrawalsService.list({ page: 1, limit: 1, status: "REJECTED" }),
        ]);

      return {
        pending: pending.total,
        approved: approved.total,
        inProgress: inProgress.total,
        paymentDone: paymentDone.total,
        rejected: rejected.total,
      };
    },
  });
}

export function useWithdrawalById(withdrawalId?: string) {
  return useQuery({
    queryKey: [WITHDRAWAL_DETAIL_KEY, withdrawalId],
    queryFn: () => withdrawalsService.getById(String(withdrawalId)),
    enabled: Boolean(withdrawalId),
  });
}

function invalidateWithdrawalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [WITHDRAWAL_LIST_KEY] });
  queryClient.invalidateQueries({ queryKey: [WITHDRAWAL_DETAIL_KEY] });
  queryClient.invalidateQueries({ queryKey: [WITHDRAWAL_SUMMARY_KEY] });
}

export function useUpdateWithdrawalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      withdrawalId: string;
      payload: UpdateWithdrawalStatusPayload;
    }) => withdrawalsService.updateStatus(input.withdrawalId, input.payload),
    onSuccess: (_data, variables) => {
      toast.success(`Status updated to ${variables.payload.status.replace("_", " ")}`);
      invalidateWithdrawalQueries(queryClient);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update withdrawal status";
      toast.error(message);
    },
  });
}

export function useUpdateWithdrawalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { withdrawalId: string; adminNote: string }) =>
      withdrawalsService.updateNote(input.withdrawalId, input.adminNote),
    onSuccess: () => {
      toast.success("Admin note updated");
      invalidateWithdrawalQueries(queryClient);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update admin note";
      toast.error(message);
    },
  });
}

export function useUpdateWithdrawalReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { withdrawalId: string; transactionReference: string }) =>
      withdrawalsService.updateReference(
        input.withdrawalId,
        input.transactionReference,
      ),
    onSuccess: () => {
      toast.success("Transaction reference updated");
      invalidateWithdrawalQueries(queryClient);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update transaction reference";
      toast.error(message);
    },
  });
}
