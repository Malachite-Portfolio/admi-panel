"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { kycService } from "@/services/kyc.service";
import type { AdminKycListItem } from "@/types";
import { formatDateTime } from "@/utils/date";

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function HostKycReviewPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const hostKycQuery = useQuery({
    queryKey: ["admin-host-kyc-list", page, status, search],
    queryFn: () =>
      kycService.getKycList({
        page,
        limit: 20,
        status,
        source: "LISTENER_ONBOARDING",
        role: "LISTENER",
        search: search || undefined,
      }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });

  const rows = useMemo(() => hostKycQuery.data?.items || [], [hostKycQuery.data?.items]);

  const columns: DataColumn<AdminKycListItem>[] = useMemo(
    () => [
      {
        key: "host",
        header: "Host",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-app-border bg-app-accent-bg">
              {row.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.profilePhotoUrl}
                  alt={row.fullName || "Host profile"}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="font-medium text-app-text-primary">{row.fullName || "Unnamed host"}</p>
              <p className="text-xs text-app-text-secondary">{row.hostListenerId || row.userId}</p>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact",
        render: (row) => (
          <div>
            <p className="text-app-text-primary">{row.phone || "-"}</p>
            <p className="text-xs text-app-text-secondary">{row.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category/Language",
        render: (row) => (
          <div>
            <p className="text-app-text-primary">{row.category || "-"}</p>
            <p className="text-xs text-app-text-secondary">
              {row.languages.length ? row.languages.join(", ") : "-"}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status.toLowerCase()} />,
      },
      {
        key: "submittedAt",
        header: "Submitted",
        render: (row) => <span>{formatDateTime(row.submittedAt)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <Link href={`/host-kyc/${row.id}`}>
            <Button size="sm" variant="secondary">
              Review
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <AdminLayout
      title="Host KYC Review"
      subtitle="Review listener onboarding verification records and approve/reject from one workflow."
    >
      <RoleGate roles={["super_admin", "admin"]}>
        {hostKycQuery.isError ? (
          <EmptyState
            title="Unable to load host verification records"
            description="Please retry. If this continues, verify admin KYC endpoints and auth session."
          />
        ) : null}

        <SearchFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onFilterChange={(_key, value) => {
            const nextStatus = String(value || "ALL");
            if (nextStatus === status) {
              return;
            }
            setStatus(nextStatus);
            setPage(1);
          }}
          onResetFilters={() => {
            setStatus("ALL");
            setSearch("");
            setPage(1);
          }}
          filters={[
            {
              key: "status",
              label: "Status",
              value: status,
              options: STATUS_FILTERS,
            },
          ]}
        />

        <DataTable
          data={rows}
          columns={columns}
          loading={hostKycQuery.isLoading && !hostKycQuery.data}
          page={hostKycQuery.data?.page}
          totalPages={hostKycQuery.data?.totalPages}
          onPageChange={setPage}
          emptyLabel={
            hostKycQuery.isError ? "Unable to load host verifications." : "No hosts found."
          }
        />
      </RoleGate>
    </AdminLayout>
  );
}
