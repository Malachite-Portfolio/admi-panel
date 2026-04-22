"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { StatusBadge } from "@/components/ui/status-badge";
import { kycService } from "@/services/kyc.service";
import type { AdminKycDetail, AdminKycListResponse } from "@/types";
import { formatDateTime } from "@/utils/date";

const mapOnboardingDetails = (input: Record<string, unknown> | null | undefined) => {
  if (!input || typeof input !== "object") {
    return [] as Array<{ key: string; value: string }>;
  }

  return Object.entries(input)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return null;
      }

      if (Array.isArray(value)) {
        const normalized = value
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(", ");
        if (!normalized) {
          return null;
        }
        return { key, value: normalized };
      }

      if (typeof value === "object") {
        const normalized = JSON.stringify(value);
        return normalized ? { key, value: normalized } : null;
      }

      const normalized = String(value).trim();
      if (!normalized) {
        return null;
      }
      return { key, value: normalized };
    })
    .filter((item): item is { key: string; value: string } => Boolean(item));
};

export default function HostKycReviewDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const kycId = String(params.id || "");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const detailQuery = useQuery({
    queryKey: ["admin-host-kyc-detail", kycId],
    queryFn: () => kycService.getKycById(kycId),
    enabled: Boolean(kycId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const updateCachedRows = (updatedDetail: AdminKycDetail) => {
    const patchRows = (previousData: AdminKycListResponse | undefined) => {
      if (!previousData) {
        return previousData;
      }

      return {
        ...previousData,
        items: previousData.items.map((item) =>
          item.id === updatedDetail.id
            ? {
                ...item,
                hostListenerId: updatedDetail.hostListenerId,
                source: updatedDetail.source,
                fullName: updatedDetail.fullName,
                phone: updatedDetail.phone,
                email: updatedDetail.email,
                profilePhotoUrl: updatedDetail.profilePhotoUrl,
                role: updatedDetail.role,
                category: updatedDetail.category,
                languages: updatedDetail.languages,
                status: updatedDetail.status,
                submittedAt: updatedDetail.submittedAt,
                reviewedAt: updatedDetail.reviewedAt,
              }
            : item,
        ),
      };
    };

    queryClient.setQueriesData<AdminKycListResponse>(
      { queryKey: ["admin-host-kyc-list"] },
      patchRows,
    );
  };

  const approveMutation = useMutation({
    mutationFn: () => kycService.approveKyc(kycId),
    onSuccess: async (updatedDetail) => {
      queryClient.setQueryData(["admin-host-kyc-detail", kycId], updatedDetail);
      updateCachedRows(updatedDetail);
      toast.success("Host KYC approved");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-host-kyc-list"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-host-kyc-detail", kycId] }),
      ]);
      setApproveModalOpen(false);
    },
    onError: () => {
      toast.error("Unable to approve host KYC");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => kycService.rejectKyc(kycId, reviewNote.trim()),
    onSuccess: async (updatedDetail) => {
      queryClient.setQueryData(["admin-host-kyc-detail", kycId], updatedDetail);
      updateCachedRows(updatedDetail);
      toast.success("Host KYC rejected");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-host-kyc-list"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-host-kyc-detail", kycId] }),
      ]);
      setReviewNote("");
      setRejectModalOpen(false);
    },
    onError: () => {
      toast.error("Unable to reject host KYC");
    },
  });

  const mediaCards = useMemo(() => {
    if (!detailQuery.data) {
      return [] as Array<{ label: string; url: string | null }>;
    }

    const cards: Array<{ label: string; url: string | null }> = [
      { label: "Aadhaar Front", url: detailQuery.data.aadhaarFrontUrl },
      { label: "Aadhaar Back", url: detailQuery.data.aadhaarBackUrl },
      { label: "Selfie", url: detailQuery.data.selfieUrl },
    ];

    if (detailQuery.data.governmentIdUrl) {
      cards.push({
        label: detailQuery.data.governmentIdType
          ? `${detailQuery.data.governmentIdType} (Government ID)`
          : "Government ID",
        url: detailQuery.data.governmentIdUrl,
      });
    }

    return cards;
  }, [detailQuery.data]);

  const onboardingEntries = useMemo(
    () => mapOnboardingDetails(detailQuery.data?.onboardingData),
    [detailQuery.data?.onboardingData],
  );

  if (detailQuery.isLoading) {
    return (
      <AdminLayout title="Host KYC Review">
        <PageLoader />
      </AdminLayout>
    );
  }

  if (!detailQuery.data) {
    return (
      <AdminLayout title="Host KYC Review">
        <EmptyState
          title="Host verification record not found"
          description="The requested record does not exist or cannot be accessed."
        />
      </AdminLayout>
    );
  }

  const detail = detailQuery.data;
  const canReview = detail.status === "PENDING";
  const isActionInProgress = approveMutation.isPending || rejectMutation.isPending;

  return (
    <AdminLayout
      title="Host KYC Review"
      subtitle={`Reviewing host/listener record ${detail.hostListenerId || detail.userId}`}
    >
      <RoleGate roles={["super_admin", "admin"]}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {canReview ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={isActionInProgress}
                onClick={() => setRejectModalOpen(true)}
              >
                Reject Host
              </Button>
              <Button
                disabled={isActionInProgress}
                onClick={() => setApproveModalOpen(true)}
              >
                Approve Host
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-app-border px-3 py-2 text-xs text-app-text-secondary">
              Review actions are available only when status is PENDING.
            </div>
          )}
        </div>

        <Card className="space-y-4">
          <CardTitle className="text-base">Host Verification Details</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-app-border p-3 md:row-span-2">
              <p className="text-xs text-app-text-muted">Profile Photo</p>
              {detail.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.profilePhotoUrl}
                  alt={detail.fullName || "Host profile"}
                  className="mt-2 h-56 w-full rounded-xl border border-app-border object-cover"
                />
              ) : (
                <p className="mt-2 text-sm text-app-text-secondary">Not uploaded</p>
              )}
            </div>

            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Full Name</p>
              <p className="mt-1 font-medium text-app-text-primary">{detail.fullName || "-"}</p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Host/Listener ID</p>
              <p className="mt-1 font-medium text-app-text-primary">
                {detail.hostListenerId || detail.userId}
              </p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Phone</p>
              <p className="mt-1 font-medium text-app-text-primary">{detail.phone || "-"}</p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Email</p>
              <p className="mt-1 font-medium text-app-text-primary">{detail.email || "-"}</p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Category</p>
              <p className="mt-1 font-medium text-app-text-primary">{detail.category || "-"}</p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Languages</p>
              <p className="mt-1 font-medium text-app-text-primary">
                {detail.languages.length ? detail.languages.join(", ") : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">DOB</p>
              <p className="mt-1 font-medium text-app-text-primary">{detail.dob || "-"}</p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Aadhaar Last 4</p>
              <p className="mt-1 font-medium text-app-text-primary">{detail.aadhaarLast4 || "-"}</p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Status</p>
              <div className="mt-2">
                <StatusBadge status={detail.status.toLowerCase()} />
              </div>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Submitted At</p>
              <p className="mt-1 font-medium text-app-text-primary">
                {formatDateTime(detail.submittedAt)}
              </p>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Reviewed At</p>
              <p className="mt-1 font-medium text-app-text-primary">
                {formatDateTime(detail.reviewedAt)}
              </p>
            </div>
          </div>
          {detail.reviewNote ? (
            <div className="rounded-xl border border-app-border p-3">
              <p className="text-xs text-app-text-muted">Rejection/Review Note</p>
              <p className="mt-1 text-app-text-primary">{detail.reviewNote}</p>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <CardTitle className="text-base">Onboarding Data</CardTitle>
          {onboardingEntries.length === 0 ? (
            <p className="text-sm text-app-text-secondary">No onboarding details submitted.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {onboardingEntries.map((entry) => (
                <div key={entry.key} className="rounded-xl border border-app-border p-3">
                  <p className="text-[11px] uppercase tracking-wide text-app-text-muted">
                    {entry.key}
                  </p>
                  <p className="mt-1 text-sm text-app-text-primary break-words">{entry.value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mediaCards.map((item) => (
            <Card key={item.label} className="space-y-2">
              <CardTitle className="text-sm">{item.label}</CardTitle>
              {item.url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.label}
                    className="h-52 w-full rounded-xl border border-app-border object-contain bg-black/20"
                  />
                  <a
                    className="text-xs text-app-accent underline"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original
                  </a>
                </>
              ) : (
                <p className="text-sm text-app-text-secondary">Not uploaded</p>
              )}
            </Card>
          ))}
        </div>

        <ConfirmationModal
          open={approveModalOpen}
          title="Approve Host KYC"
          description="Approve this host/listener verification and unlock gated host features."
          confirmLabel="Approve Host"
          isLoading={approveMutation.isPending}
          disableConfirm={!canReview || isActionInProgress}
          onCancel={() => setApproveModalOpen(false)}
          onConfirm={() => approveMutation.mutate()}
        />

        <ConfirmationModal
          open={rejectModalOpen}
          title="Reject Host KYC"
          description="Rejection requires a reason."
          confirmLabel="Reject Host"
          isLoading={rejectMutation.isPending}
          disableConfirm={!canReview || isActionInProgress}
          onCancel={() => {
            setRejectModalOpen(false);
            setReviewNote("");
          }}
          onConfirm={() => {
            if (!reviewNote.trim()) {
              toast.error("Rejection reason is required");
              return;
            }
            rejectMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <p className="text-xs text-app-text-secondary">Rejection reason (required)</p>
            <textarea
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              className="min-h-[110px] w-full rounded-xl border border-app-border bg-[#120e21] px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-accent"
              placeholder="Add a clear reason for rejection"
            />
          </div>
        </ConfirmationModal>
      </RoleGate>
    </AdminLayout>
  );
}
