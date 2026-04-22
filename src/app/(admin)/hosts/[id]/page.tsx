"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleGate } from "@/components/layout/role-gate";
import { EarningsCard } from "@/components/hosts/earnings-card";
import { PricingCard } from "@/components/hosts/pricing-card";
import { ProfileCard } from "@/components/hosts/profile-card";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/loader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs } from "@/components/ui/tabs";
import { useHost, useHostAction, useHostUpdate } from "@/features/hosts/use-hosts";
import { hostsService } from "@/services/hosts.service";
import type { HostAction, HostPriceLog, HostSessionHistoryItem } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type DetailsTab = "overview" | "sessions" | "earnings" | "pricing-history";

export default function HostDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hostId = params.id;

  const hostQuery = useHost(hostId);
  const actionMutation = useHostAction(hostId);
  const updateMutation = useHostUpdate(hostId);

  const [tab, setTab] = useState<DetailsTab>("overview");
  const [pendingAction, setPendingAction] = useState<HostAction | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [sessionHistory, setSessionHistory] = useState<HostSessionHistoryItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<HostPriceLog[]>([]);

  const host = hostQuery.data;
  const onboardingEntries = useMemo(() => {
    const source = host?.onboardingData ?? {};
    if (!source || typeof source !== "object") {
      return [] as Array<{ key: string; value: string }>;
    }

    return Object.entries(source)
      .map(([key, value]) => {
        if (value === null || value === undefined) {
          return null;
        }

        if (Array.isArray(value)) {
          return {
            key,
            value: value
              .map((item) => String(item).trim())
              .filter(Boolean)
              .join(", "),
          };
        }

        if (typeof value === "object") {
          return {
            key,
            value: JSON.stringify(value),
          };
        }

        return {
          key,
          value: String(value),
        };
      })
      .filter((item): item is { key: string; value: string } => Boolean(item && item.value))
      .slice(0, 20);
  }, [host?.onboardingData]);

  const loadSessionHistory = async () => {
    try {
      const result = await hostsService.getHostSessionHistory(hostId);
      setSessionHistory(result);
    } catch {
      setSessionHistory([]);
    }
  };

  const loadPricingLogs = async () => {
    try {
      const result = await hostsService.getHostPricingLogs(hostId);
      setPriceHistory(result);
    } catch {
      setPriceHistory([]);
    }
  };

  const sessionColumns: DataColumn<HostSessionHistoryItem>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Type",
        render: (row) => <StatusBadge status={row.type} />,
      },
      {
        key: "user",
        header: "User",
        render: (row) => <span>{row.userName}</span>,
      },
      {
        key: "start",
        header: "Started",
        render: (row) => <span>{formatDateTime(row.startedAt)}</span>,
      },
      {
        key: "end",
        header: "Ended",
        render: (row) => <span>{formatDateTime(row.endedAt)}</span>,
      },
      {
        key: "duration",
        header: "Duration",
        render: (row) => <span>{row.durationMinutes} mins</span>,
      },
      {
        key: "billing",
        header: "Billed",
        render: (row) => <span className="font-semibold">{formatInr(row.billedAmount)}</span>,
      },
    ],
    [],
  );

  const pricingColumns: DataColumn<HostPriceLog>[] = useMemo(
    () => [
      {
        key: "changedAt",
        header: "Changed At",
        render: (row) => <span>{formatDateTime(row.changedAt)}</span>,
      },
      {
        key: "oldRates",
        header: "Old Rates",
        render: (row) => (
          <span>
            Call {formatInr(row.oldCallRate)} | Chat {formatInr(row.oldChatRate)}
          </span>
        ),
      },
      {
        key: "newRates",
        header: "New Rates",
        render: (row) => (
          <span>
            Call {formatInr(row.newCallRate)} | Chat {formatInr(row.newChatRate)}
          </span>
        ),
      },
      {
        key: "by",
        header: "Changed By",
        render: (row) => <span>{row.changedBy}</span>,
      },
    ],
    [],
  );

  if (hostQuery.isLoading) {
    return (
      <AdminLayout title="Host Details">
        <PageLoader />
      </AdminLayout>
    );
  }

  if (!host) {
    return (
      <AdminLayout title="Host Details">
        <EmptyState
          title="Host not found"
          description="The host profile you requested does not exist or has been removed."
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Host Profile Control"
      subtitle={`Manage ${host.displayName} profile, moderation, pricing, and earnings.`}
    >
      <RoleGate roles={["super_admin", "admin"]}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setActionNote("");
              setPendingAction(host.verificationStatus === "verified" ? "reject" : "approve");
            }}
          >
            <ShieldCheck className="h-4 w-4" />
            {host.verificationStatus === "verified" ? "Reject" : "Approve"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setActionNote("");
              setPendingAction(host.status === "suspended" ? "reactivate" : "suspend");
            }}
          >
            <ShieldAlert className="h-4 w-4" />
            {host.status === "suspended" ? "Reactivate" : "Suspend"}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              {
                setActionNote("");
                setPendingAction(host.visibility === "visible" ? "hide" : "show");
              }
            }
          >
            {host.visibility === "visible" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {host.visibility === "visible" ? "Hide Host" : "Show Host"}
          </Button>
        </div>
      </div>

      <ProfileCard host={host} />

      <Tabs
        value={tab}
        onChange={async (nextTab) => {
          setTab(nextTab as DetailsTab);
          if (nextTab === "sessions") {
            await loadSessionHistory();
          }
          if (nextTab === "pricing-history") {
            await loadPricingLogs();
          }
        }}
        items={[
          { label: "Overview", value: "overview" },
          { label: "Sessions", value: "sessions" },
          { label: "Earnings", value: "earnings" },
          { label: "Pricing Logs", value: "pricing-history" },
        ]}
      />

      {tab === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <PricingCard
            host={host}
            onSave={async (payload) => {
              await updateMutation.mutateAsync(payload);
            }}
          />
          <Card className="space-y-4">
            <CardTitle className="text-base">Moderation & Controls</CardTitle>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-app-border p-3">
                <p className="text-xs text-app-text-muted">Verification Status</p>
                <div className="mt-2">
                  <StatusBadge status={host.verificationStatus} />
                </div>
                <p className="mt-2 text-xs text-app-text-muted">
                  Submitted: {host.submittedAt ? formatDateTime(host.submittedAt) : "-"}
                </p>
                <p className="mt-1 text-xs text-app-text-muted">
                  Reviewed: {host.reviewedAt ? formatDateTime(host.reviewedAt) : "-"}
                </p>
                {host.verificationNote ? (
                  <p className="mt-2 text-xs text-rose-300">Note: {host.verificationNote}</p>
                ) : null}
              </div>
              <div className="rounded-xl border border-app-border p-3">
                <p className="text-xs text-app-text-muted">Current Presence</p>
                <div className="mt-2">
                  <StatusBadge status={host.presence} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-app-border p-3">
              <p className="text-sm font-semibold text-app-text-primary">Onboarding Details</p>
              {onboardingEntries.length === 0 ? (
                <p className="mt-2 text-xs text-app-text-muted">No onboarding data submitted yet.</p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {onboardingEntries.map((item) => (
                    <div key={item.key} className="rounded-lg border border-app-border/70 p-2">
                      <p className="text-[11px] uppercase tracking-wide text-app-text-muted">
                        {item.key}
                      </p>
                      <p className="mt-1 text-sm text-app-text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-app-border/70 p-2">
                  <p className="text-[11px] uppercase tracking-wide text-app-text-muted">
                    Profile Image
                  </p>
                  {host.profileImageRef ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={host.profileImageRef}
                        alt="Listener profile"
                        className="mt-2 h-40 w-full rounded-lg object-cover"
                      />
                      <a
                        className="mt-2 inline-flex text-xs text-app-accent underline"
                        href={host.profileImageRef}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open original
                      </a>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-app-text-muted">Not uploaded</p>
                  )}
                </div>

                <div className="rounded-lg border border-app-border/70 p-2">
                  <p className="text-[11px] uppercase tracking-wide text-app-text-muted">
                    Government ID
                  </p>
                  <p className="mt-1 text-xs text-app-text-secondary">
                    Type: {host.governmentIdType || "-"}
                  </p>
                  {host.governmentIdImageRef ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={host.governmentIdImageRef}
                        alt="Government ID"
                        className="mt-2 h-40 w-full rounded-lg object-cover"
                      />
                      <a
                        className="mt-2 inline-flex text-xs text-app-accent underline"
                        href={host.governmentIdImageRef}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open original
                      </a>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-app-text-muted">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setActionNote("");
                  setPendingAction("forceOffline");
                }}
              >
                Force Offline
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "sessions" ? (
        <Card>
          <CardTitle className="mb-3 text-base">Session History</CardTitle>
          <DataTable data={sessionHistory} columns={sessionColumns} />
        </Card>
      ) : null}

      {tab === "earnings" ? <EarningsCard host={host} /> : null}

      {tab === "pricing-history" ? (
        <Card>
          <CardTitle className="mb-3 text-base">Pricing History</CardTitle>
          <DataTable data={priceHistory} columns={pricingColumns} />
        </Card>
      ) : null}

      <ConfirmationModal
        open={Boolean(pendingAction)}
        title="Confirm Host Action"
        description={`Are you sure you want to ${pendingAction} this host?`}
        confirmLabel={pendingAction === "reject" ? "Reject Listener" : "Confirm"}
        onCancel={() => {
          setActionNote("");
          setPendingAction(null);
        }}
        isLoading={actionMutation.isPending}
        onConfirm={async () => {
          if (!pendingAction) {
            return;
          }
          if (pendingAction === "reject" && !actionNote.trim()) {
            toast.error("Rejection reason is required");
            return;
          }
          try {
            await actionMutation.mutateAsync({
              action: pendingAction,
              payload:
                pendingAction === "reject" || pendingAction === "approve"
                  ? { note: actionNote.trim() }
                  : undefined,
            });
            toast.success("Host status updated");
            setActionNote("");
            setPendingAction(null);
          } catch {
            toast.error("Unable to perform this action");
          }
        }}
      >
        {pendingAction === "reject" ? (
          <div className="space-y-2">
            <p className="text-xs text-app-text-secondary">Rejection reason (required)</p>
            <textarea
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              className="min-h-[84px] w-full rounded-xl border border-app-border bg-[#120e21] px-3 py-2 text-sm text-app-text-primary outline-none focus:border-app-accent"
              placeholder="Add a reason for rejection"
            />
          </div>
        ) : null}
      </ConfirmationModal>
      </RoleGate>
    </AdminLayout>
  );
}
