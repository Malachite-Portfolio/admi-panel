"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminWithdrawals,
  useUpdateWithdrawalNote,
  useUpdateWithdrawalReference,
  useUpdateWithdrawalStatus,
  useWithdrawalById,
  useWithdrawalSummary,
} from "@/features/withdrawals/use-withdrawals";
import type { AdminWithdrawal, UpdateWithdrawalStatusPayload } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type WithdrawalTabValue =
  | "all"
  | "pending"
  | "approved"
  | "in_progress"
  | "payment_done"
  | "rejected";

const STATUS_FILTERS: Array<{ label: string; value: WithdrawalTabValue }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In Progress", value: "in_progress" },
  { label: "Payment Done", value: "payment_done" },
  { label: "Rejected", value: "rejected" },
];

const TAB_TO_STATUS: Record<
  WithdrawalTabValue,
  "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "PAYMENT_DONE" | undefined
> = {
  all: undefined,
  pending: "PENDING",
  approved: "APPROVED",
  in_progress: "IN_PROGRESS",
  payment_done: "PAYMENT_DONE",
  rejected: "REJECTED",
};

const TRANSITION_ACTIONS: Record<
  AdminWithdrawal["status"],
  Array<UpdateWithdrawalStatusPayload["status"]>
> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["IN_PROGRESS"],
  IN_PROGRESS: ["PAYMENT_DONE"],
  REJECTED: [],
  PAYMENT_DONE: [],
};

const STATUS_ACTION_LABELS: Record<UpdateWithdrawalStatusPayload["status"], string> = {
  APPROVED: "Approve",
  REJECTED: "Reject",
  IN_PROGRESS: "Mark In Progress",
  PAYMENT_DONE: "Mark Payment Done",
};

const STATUS_ACTION_STYLE: Record<
  UpdateWithdrawalStatusPayload["status"],
  "default" | "secondary" | "danger"
> = {
  APPROVED: "default",
  REJECTED: "danger",
  IN_PROGRESS: "secondary",
  PAYMENT_DONE: "default",
};

const canEditReference = (status: AdminWithdrawal["status"]) =>
  status === "IN_PROGRESS" || status === "PAYMENT_DONE";

const summarize = (value?: string | null, maxLength = 32) => {
  if (!value) {
    return "-";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

const statusActionDescription = (
  status: UpdateWithdrawalStatusPayload["status"],
) => {
  if (status === "REJECTED") {
    return "Funds will be restored to available listener balance.";
  }
  if (status === "PAYMENT_DONE") {
    return "Locked withdrawal balance will be finalized as payout.";
  }
  return "This action updates request lifecycle state.";
};

const getActionList = (status: AdminWithdrawal["status"]) =>
  TRANSITION_ACTIONS[status] || [];

export default function WithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<WithdrawalTabValue>("all");
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<{
    withdrawal: AdminWithdrawal;
    nextStatus: UpdateWithdrawalStatusPayload["status"];
  } | null>(null);
  const [noteEditor, setNoteEditor] = useState<{
    withdrawal: AdminWithdrawal;
    value: string;
  } | null>(null);
  const [referenceEditor, setReferenceEditor] = useState<{
    withdrawal: AdminWithdrawal;
    value: string;
    markPaidAfterSave: boolean;
  } | null>(null);

  const listQuery = useAdminWithdrawals({
    page,
    limit: 10,
    status: TAB_TO_STATUS[statusTab],
  });
  const summaryQuery = useWithdrawalSummary();
  const detailQuery = useWithdrawalById(selectedWithdrawalId ?? undefined);

  const updateStatusMutation = useUpdateWithdrawalStatus();
  const updateNoteMutation = useUpdateWithdrawalNote();
  const updateReferenceMutation = useUpdateWithdrawalReference();

  const isMutating =
    updateStatusMutation.isPending ||
    updateNoteMutation.isPending ||
    updateReferenceMutation.isPending;

  const withdrawals = listQuery.data?.items ?? [];
  const summary = summaryQuery.data;

  const columns: DataColumn<AdminWithdrawal>[] = useMemo(
    () => [
      {
        key: "listener",
        header: "Listener",
        render: (row) => (
          <div>
            <p className="font-medium text-app-text-primary">
              {row.listener?.displayName || "Unknown listener"}
            </p>
            <p className="text-xs text-app-text-secondary">
              {row.listener?.phone || row.listenerId}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (row) => <span className="font-semibold">{formatInr(row.amount)}</span>,
      },
      {
        key: "requestedAt",
        header: "Requested",
        render: (row) => <span>{formatDateTime(row.requestedAt)}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "bank",
        header: "Bank Details",
        render: (row) => (
          <div className="text-xs text-app-text-secondary">
            <p className="text-sm text-app-text-primary">{row.bankName}</p>
            <p>{row.accountHolderName}</p>
            <p>
              A/C ****{row.accountNumberLast4} - {row.ifscCode}
            </p>
          </div>
        ),
      },
      {
        key: "note",
        header: "Admin Note",
        render: (row) => <span>{summarize(row.adminNote)}</span>,
      },
      {
        key: "reference",
        header: "Transaction Ref",
        render: (row) => <span>{summarize(row.transactionReference, 24)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex max-w-[360px] flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedWithdrawalId(row.id)}
            >
              View
            </Button>
            {getActionList(row.status).map((actionStatus) => (
              <Button
                key={actionStatus}
                size="sm"
                variant={STATUS_ACTION_STYLE[actionStatus]}
                disabled={isMutating}
                onClick={() => {
                  if (
                    actionStatus === "PAYMENT_DONE" &&
                    !row.transactionReference?.trim()
                  ) {
                    setReferenceEditor({
                      withdrawal: row,
                      value: "",
                      markPaidAfterSave: true,
                    });
                    return;
                  }

                  setConfirmAction({ withdrawal: row, nextStatus: actionStatus });
                }}
              >
                {STATUS_ACTION_LABELS[actionStatus]}
              </Button>
            ))}
            <Button
              size="sm"
              variant="secondary"
              disabled={isMutating}
              onClick={() =>
                setNoteEditor({
                  withdrawal: row,
                  value: row.adminNote || "",
                })
              }
            >
              Note
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isMutating || !canEditReference(row.status)}
              title={
                canEditReference(row.status)
                  ? "Add or edit transaction reference"
                  : "Reference can be updated only for In Progress or Payment Done"
              }
              onClick={() =>
                setReferenceEditor({
                  withdrawal: row,
                  value: row.transactionReference || "",
                  markPaidAfterSave: false,
                })
              }
            >
              Reference
            </Button>
          </div>
        ),
      },
    ],
    [isMutating],
  );

  const detail = detailQuery.data;
  const detailActions = detail ? getActionList(detail.status) : [];

  return (
    <AdminLayout
      title="Withdrawal Management"
      subtitle="Review listener withdrawal requests and update payout lifecycle in real time."
    >
      <RoleGate roles={["super_admin", "admin"]}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Pending"
            value={summaryQuery.isLoading ? "--" : String(summary?.pending ?? 0)}
          />
          <StatCard
            label="Approved"
            value={summaryQuery.isLoading ? "--" : String(summary?.approved ?? 0)}
          />
          <StatCard
            label="In Progress"
            value={summaryQuery.isLoading ? "--" : String(summary?.inProgress ?? 0)}
          />
          <StatCard
            label="Payment Done"
            value={summaryQuery.isLoading ? "--" : String(summary?.paymentDone ?? 0)}
          />
          <StatCard
            label="Rejected"
            value={summaryQuery.isLoading ? "--" : String(summary?.rejected ?? 0)}
          />
        </div>

        <div className="glass-card rounded-2xl border border-app-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              items={STATUS_FILTERS}
              value={statusTab}
              onChange={(value) => {
                setStatusTab(value as WithdrawalTabValue);
                setPage(1);
              }}
            />
            <Button
              variant="secondary"
              onClick={() => {
                listQuery.refetch();
                summaryQuery.refetch();
              }}
              disabled={listQuery.isFetching || summaryQuery.isFetching}
            >
              Refresh
            </Button>
          </div>
        </div>

        {listQuery.isError ? (
          <div className="glass-card rounded-2xl border border-app-danger/40 p-5">
            <p className="font-semibold text-app-text-primary">
              Failed to load withdrawal requests
            </p>
            <p className="mt-1 text-sm text-app-text-secondary">
              {(
                listQuery.error as { response?: { data?: { message?: string } } }
              )?.response?.data?.message || "Please retry."}
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => listQuery.refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <DataTable
            data={withdrawals}
            columns={columns}
            loading={listQuery.isLoading}
            page={listQuery.data?.page}
            totalPages={listQuery.data?.totalPages}
            onPageChange={setPage}
            emptyLabel="No withdrawal requests found for this status."
          />
        )}

        {selectedWithdrawalId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="glass-card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-app-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-app-text-primary">
                    Withdrawal Details
                  </p>
                  <p className="mt-1 text-sm text-app-text-secondary">
                    Request ID: {selectedWithdrawalId}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedWithdrawalId(null)}
                >
                  Close
                </Button>
              </div>

              {detailQuery.isLoading ? (
                <p className="mt-6 text-sm text-app-text-secondary">Loading details...</p>
              ) : null}

              {detailQuery.isError ? (
                <div className="mt-6 rounded-xl border border-app-danger/40 bg-app-danger/10 p-4">
                  <p className="text-sm text-app-text-primary">
                    {(
                      detailQuery.error as {
                        response?: { data?: { message?: string } };
                      }
                    )?.response?.data?.message || "Unable to load withdrawal details."}
                  </p>
                </div>
              ) : null}

              {detail ? (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-app-border bg-black/20 p-4">
                      <p className="text-xs text-app-text-muted">Listener</p>
                      <p className="mt-1 font-medium text-app-text-primary">
                        {detail.listener?.displayName || "Unknown listener"}
                      </p>
                      <p className="text-sm text-app-text-secondary">
                        {detail.listener?.phone || detail.listenerId}
                      </p>
                    </div>
                    <div className="rounded-xl border border-app-border bg-black/20 p-4">
                      <p className="text-xs text-app-text-muted">Amount</p>
                      <p className="mt-1 text-xl font-semibold text-app-text-primary">
                        {formatInr(detail.amount)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={detail.status} />
                      </div>
                    </div>
                    <div className="rounded-xl border border-app-border bg-black/20 p-4">
                      <p className="text-xs text-app-text-muted">Bank Details</p>
                      <p className="mt-1 text-sm text-app-text-primary">
                        {detail.bankName}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        {detail.accountHolderName}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        A/C ****{detail.accountNumberLast4} - {detail.ifscCode}
                      </p>
                    </div>
                    <div className="rounded-xl border border-app-border bg-black/20 p-4">
                      <p className="text-xs text-app-text-muted">Admin Inputs</p>
                      <p className="mt-1 text-sm text-app-text-primary">
                        Note: {detail.adminNote || "-"}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        Ref: {detail.transactionReference || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-app-border bg-black/20 p-4">
                    <p className="text-sm font-semibold text-app-text-primary">
                      Status Timeline
                    </p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <p className="text-xs text-app-text-secondary">
                        Requested: {formatDateTime(detail.requestedAt)}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        Approved:{" "}
                        {detail.approvedAt ? formatDateTime(detail.approvedAt) : "-"}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        In Progress:{" "}
                        {detail.processingAt
                          ? formatDateTime(detail.processingAt)
                          : "-"}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        Payment Done:{" "}
                        {detail.paidAt ? formatDateTime(detail.paidAt) : "-"}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        Rejected:{" "}
                        {detail.rejectedAt ? formatDateTime(detail.rejectedAt) : "-"}
                      </p>
                      <p className="text-xs text-app-text-secondary">
                        Last Updated: {formatDateTime(detail.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {detailActions.map((actionStatus) => (
                      <Button
                        key={actionStatus}
                        variant={STATUS_ACTION_STYLE[actionStatus]}
                        disabled={isMutating}
                        onClick={() => {
                          if (
                            actionStatus === "PAYMENT_DONE" &&
                            !detail.transactionReference?.trim()
                          ) {
                            setReferenceEditor({
                              withdrawal: detail,
                              value: "",
                              markPaidAfterSave: true,
                            });
                            return;
                          }

                          setConfirmAction({
                            withdrawal: detail,
                            nextStatus: actionStatus,
                          });
                        }}
                      >
                        {STATUS_ACTION_LABELS[actionStatus]}
                      </Button>
                    ))}
                    <Button
                      variant="secondary"
                      disabled={isMutating}
                      onClick={() =>
                        setNoteEditor({
                          withdrawal: detail,
                          value: detail.adminNote || "",
                        })
                      }
                    >
                      Add / Edit Note
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={isMutating || !canEditReference(detail.status)}
                      onClick={() =>
                        setReferenceEditor({
                          withdrawal: detail,
                          value: detail.transactionReference || "",
                          markPaidAfterSave: false,
                        })
                      }
                    >
                      Add / Edit Reference
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {confirmAction ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
            <div className="glass-card w-full max-w-md rounded-2xl border border-app-border p-5">
              <p className="text-lg font-semibold text-app-text-primary">
                {STATUS_ACTION_LABELS[confirmAction.nextStatus]}
              </p>
              <p className="mt-2 text-sm text-app-text-secondary">
                Listener:{" "}
                {confirmAction.withdrawal.listener?.displayName ||
                  confirmAction.withdrawal.listenerId}
              </p>
              <p className="text-sm text-app-text-secondary">
                {statusActionDescription(confirmAction.nextStatus)}
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={isMutating}
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={STATUS_ACTION_STYLE[confirmAction.nextStatus]}
                  disabled={isMutating}
                  onClick={async () => {
                    await updateStatusMutation.mutateAsync({
                      withdrawalId: confirmAction.withdrawal.id,
                      payload: { status: confirmAction.nextStatus },
                    });
                    setConfirmAction(null);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {noteEditor ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
            <div className="glass-card w-full max-w-xl rounded-2xl border border-app-border p-5">
              <p className="text-lg font-semibold text-app-text-primary">
                Add / Edit Admin Note
              </p>
              <p className="mt-1 text-sm text-app-text-secondary">
                Request ID: {noteEditor.withdrawal.id}
              </p>
              <Textarea
                className="mt-4"
                value={noteEditor.value}
                onChange={(event) =>
                  setNoteEditor((prev) =>
                    prev ? { ...prev, value: event.target.value } : prev,
                  )
                }
                placeholder="Add note for this withdrawal request..."
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={isMutating}
                  onClick={() => setNoteEditor(null)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isMutating || !noteEditor.value.trim()}
                  onClick={async () => {
                    await updateNoteMutation.mutateAsync({
                      withdrawalId: noteEditor.withdrawal.id,
                      adminNote: noteEditor.value.trim(),
                    });
                    setNoteEditor(null);
                  }}
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {referenceEditor ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
            <div className="glass-card w-full max-w-lg rounded-2xl border border-app-border p-5">
              <p className="text-lg font-semibold text-app-text-primary">
                {referenceEditor.markPaidAfterSave
                  ? "Add Reference & Mark Payment Done"
                  : "Add / Edit Transaction Reference"}
              </p>
              <p className="mt-1 text-sm text-app-text-secondary">
                Request ID: {referenceEditor.withdrawal.id}
              </p>
              <Input
                className="mt-4"
                value={referenceEditor.value}
                onChange={(event) =>
                  setReferenceEditor((prev) =>
                    prev ? { ...prev, value: event.target.value } : prev,
                  )
                }
                placeholder="Enter bank transfer/reference ID"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={isMutating}
                  onClick={() => setReferenceEditor(null)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isMutating || !referenceEditor.value.trim()}
                  onClick={async () => {
                    if (referenceEditor.markPaidAfterSave) {
                      await updateStatusMutation.mutateAsync({
                        withdrawalId: referenceEditor.withdrawal.id,
                        payload: {
                          status: "PAYMENT_DONE",
                          transactionReference: referenceEditor.value.trim(),
                        },
                      });
                    } else {
                      await updateReferenceMutation.mutateAsync({
                        withdrawalId: referenceEditor.withdrawal.id,
                        transactionReference: referenceEditor.value.trim(),
                      });
                    }
                    setReferenceEditor(null);
                  }}
                >
                  {referenceEditor.markPaidAfterSave
                    ? "Save & Mark Done"
                    : "Save Reference"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </RoleGate>
    </AdminLayout>
  );
}

