"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, ShieldCheck, UserRoundPen } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleGate } from "@/components/layout/role-gate";
import { HostForm } from "@/components/hosts/host-form";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs } from "@/components/ui/tabs";
import type { HostFormValues } from "@/features/hosts/host-schema";
import { useDebounce } from "@/hooks/useDebounce";
import { useCreateHost, useHosts } from "@/features/hosts/use-hosts";
import { hostsService } from "@/services/hosts.service";
import type { Host, HostAction, HostCreatePayload } from "@/types";
import { formatInr } from "@/utils/currency";
import { formatDate } from "@/utils/date";

type HostsViewMode = "list" | "add";

export default function HostsPage() {
  const [view, setView] = useState<HostsViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    verified: "all",
    accountStatus: "all",
    presence: "all",
    visibility: "all",
    category: "",
  });
  const [bulkAction, setBulkAction] = useState<HostAction>("reactivate");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const hostsQuery = useHosts({
    page,
    pageSize: 10,
    search: debouncedSearch,
    verified: filters.verified as "all" | "pending" | "verified" | "rejected",
    accountStatus: filters.accountStatus as "all" | "active" | "inactive" | "suspended" | "blocked",
    presence: filters.presence as "all" | "online" | "offline" | "busy",
    visibility: filters.visibility as "all" | "visible" | "hidden",
    category: filters.category || undefined,
    sortBy: "joinedAt",
    sortDirection: "desc",
  });

  const createHostMutation = useCreateHost();

  const bulkActionMutation = useMutation({
    mutationFn: (input: { hostIds: string[]; action: HostAction }) =>
      hostsService.bulkAction(input.hostIds, input.action),
    onSuccess: (result) => {
      toast.success(`Updated ${result.updatedCount} host records.`);
      hostsQuery.refetch();
      setSelectedIds([]);
      setConfirmOpen(false);
    },
    onError: () => {
      toast.error("Bulk action failed.");
    },
  });

  const hosts = hostsQuery.data?.items ?? [];

  const columns: DataColumn<Host>[] = useMemo(
    () => [
      {
        key: "host",
        header: "Host",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-app-border bg-app-accent-bg" />
            <div>
              <p className="font-medium text-app-text-primary">{row.displayName}</p>
              <p className="text-xs text-app-text-secondary">{row.hostId}</p>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact",
        render: (row) => (
          <div>
            <p className="text-app-text-primary">{row.phone}</p>
            <p className="text-xs text-app-text-secondary">{row.email}</p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (row) => (
          <div>
            <p className="text-app-text-primary">{row.category}</p>
            <p className="text-xs text-app-text-secondary">{row.languages.join(", ")}</p>
          </div>
        ),
      },
      {
        key: "experience",
        header: "Experience",
        render: (row) => (
          <div>
            <p>{row.experienceYears} years</p>
            <p className="text-xs text-app-text-secondary">Rating {row.rating.toFixed(1)}</p>
          </div>
        ),
      },
      {
        key: "pricing",
        header: "Pricing",
        render: (row) => (
          <div className="text-sm">
            <p>Call: {formatInr(row.callRatePerMinute)}/min</p>
            <p className="text-app-text-secondary">Chat: {formatInr(row.chatRatePerMinute)}/min</p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <div className="space-y-1">
            <StatusBadge status={row.status} />
            <StatusBadge status={row.verificationStatus} />
            <StatusBadge status={row.presence} />
          </div>
        ),
      },
      {
        key: "earnings",
        header: "Earnings",
        render: (row) => (
          <div>
            <p className="font-medium">{formatInr(row.hostEarnings)}</p>
            <p className="text-xs text-app-text-secondary">{formatDate(row.joinedAt)}</p>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex gap-2">
            <Link href={`/hosts/${row.id}`}>
              <Button size="sm" variant="secondary">
                <UserRoundPen className="h-3.5 w-3.5" />
                Manage
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  const handleCreateHost = async (
    values: HostFormValues,
    mode: "draft" | "create" | "verify",
  ) => {
    const payload: HostCreatePayload = {
      ...values,
      languages: values.languages.split(",").map((item) => item.trim()),
      specializationTags: values.specializationTags
        ? values.specializationTags.split(",").map((item) => item.trim())
        : [],
      skills: values.skills.split(",").map((item) => item.trim()),
      verificationStatus: mode === "verify" ? "verified" : values.verificationStatus,
    };

    await createHostMutation.mutateAsync(payload);
    if (mode !== "draft") {
      setView("list");
      hostsQuery.refetch();
    }
  };

  return (
    <AdminLayout
      title="Hosts Management"
      subtitle="Approve, moderate, price, and control visibility of every host profile."
    >
      <RoleGate roles={["super_admin", "admin"]}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={view}
            onChange={(value) => setView(value as HostsViewMode)}
            items={[
              { label: "Hosts List", value: "list" },
              { label: "Add New Host", value: "add" },
            ]}
          />
          <Button onClick={() => setView("add")}>
            <Plus className="h-4 w-4" />
            Add Host
          </Button>
        </div>

        {view === "list" ? (
          <>
            {hostsQuery.isError ? (
              <EmptyState
                title="Unable to load hosts"
                description="Host records are currently unavailable. Please retry."
              />
            ) : null}

            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              onFilterChange={(key, value) =>
                setFilters((prev) => ({ ...prev, [key]: value }))
              }
              onResetFilters={() =>
                setFilters({
                  verified: "all",
                  accountStatus: "all",
                  presence: "all",
                  visibility: "all",
                  category: "",
                })
              }
              filters={[
                {
                  key: "verified",
                  label: "Verification",
                  value: filters.verified,
                  options: [
                    { value: "all", label: "All" },
                    { value: "verified", label: "Verified" },
                    { value: "pending", label: "Pending" },
                    { value: "rejected", label: "Rejected" },
                  ],
                },
                {
                  key: "accountStatus",
                  label: "Account",
                  value: filters.accountStatus,
                  options: [
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "suspended", label: "Suspended" },
                  ],
                },
                {
                  key: "presence",
                  label: "Presence",
                  value: filters.presence,
                  options: [
                    { value: "all", label: "All" },
                    { value: "online", label: "Online" },
                    { value: "offline", label: "Offline" },
                    { value: "busy", label: "Busy" },
                  ],
                },
                {
                  key: "visibility",
                  label: "Visibility",
                  value: filters.visibility,
                  options: [
                    { value: "all", label: "All" },
                    { value: "visible", label: "Visible" },
                    { value: "hidden", label: "Hidden" },
                  ],
                },
              ]}
              actionSlot={
                <div className="flex items-center gap-2">
                  <select
                    value={bulkAction}
                    onChange={(event) => setBulkAction(event.target.value as HostAction)}
                    className="h-10 rounded-xl border border-app-border bg-[#140f26] px-3 text-sm text-app-text-secondary"
                  >
                    <option value="reactivate">Activate Selected</option>
                    <option value="suspend">Deactivate Selected</option>
                    <option value="approve">Verify Selected</option>
                    <option value="hide">Hide Selected</option>
                  </select>
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmOpen(true)}
                    disabled={!selectedIds.length}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Apply
                  </Button>
                </div>
              }
            />

            <DataTable
              data={hosts}
              columns={columns}
              loading={hostsQuery.isLoading}
              selectedIds={selectedIds}
              onToggleAll={() =>
                setSelectedIds((prev) =>
                  prev.length === hosts.length ? [] : hosts.map((host) => host.id),
                )
              }
              onToggleRow={(id) =>
                setSelectedIds((prev) =>
                  prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id],
                )
              }
              page={hostsQuery.data?.page}
              totalPages={hostsQuery.data?.totalPages}
              onPageChange={setPage}
              emptyLabel={
                hostsQuery.isError
                  ? "Unable to load hosts."
                  : "No hosts found for selected filters."
              }
            />
          </>
        ) : (
          <Card>
            <CardTitle className="mb-4 text-base">Create New Host Profile</CardTitle>
            <HostForm
              isSubmitting={createHostMutation.isPending}
              onSubmit={handleCreateHost}
            />
          </Card>
        )}

        <ConfirmationModal
          open={confirmOpen}
          title="Apply Bulk Host Action"
          description={`This will apply ${bulkAction} to ${selectedIds.length} selected hosts.`}
          confirmLabel="Apply Action"
          isLoading={bulkActionMutation.isPending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() =>
            bulkActionMutation.mutate({ hostIds: selectedIds, action: bulkAction })
          }
        />
      </RoleGate>
    </AdminLayout>
  );
}
