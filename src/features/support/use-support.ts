"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supportService } from "@/services/support.service";

export function useSupportTickets(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-support-tickets", params],
    queryFn: () => supportService.getTickets(params),
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      ticketId: string;
      payload: {
        status?: "open" | "in_progress" | "resolved" | "closed";
        priority?: "low" | "medium" | "high" | "critical";
        assignedTo?: string;
        reply?: string;
      };
    }) => supportService.updateTicket(input.ticketId, input.payload),
    onSuccess: () => {
      toast.success("Ticket updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
    onError: () => toast.error("Failed to update ticket"),
  });
}
