import { CalendarClock, CircleCheckBig, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Host } from "@/types";
import { formatDate } from "@/utils/date";

export function ProfileCard({ host }: { host: Host }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-app-border bg-[#16112a]">
            {host.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={host.profileImageUrl}
                alt={host.displayName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{host.displayName}</p>
            <p className="text-sm text-app-text-secondary">{host.fullName}</p>
            <p className="text-xs text-app-text-muted">Host ID: {host.hostId}</p>
          </div>
        </div>
        <div className="space-x-1">
          <StatusBadge status={host.verificationStatus} />
          <StatusBadge status={host.status} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-app-border p-3">
          <p className="text-xs text-app-text-muted">Visibility</p>
          <div className="mt-1">
            <StatusBadge status={host.visibility} />
          </div>
        </div>
        <div className="rounded-xl border border-app-border p-3">
          <p className="text-xs text-app-text-muted">Presence</p>
          <div className="mt-1">
            <StatusBadge status={host.presence} />
          </div>
        </div>
        <div className="rounded-xl border border-app-border p-3">
          <p className="text-xs text-app-text-muted">Joined</p>
          <p className="mt-1 text-sm font-medium">{formatDate(host.joinedAt)}</p>
        </div>
      </div>

      <div className="grid gap-3 text-sm text-app-text-secondary md:grid-cols-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-app-accent" />
          <span>{host.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleCheckBig className="h-4 w-4 text-app-accent" />
          <span>{host.languages.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-app-accent" />
          <span>{host.experienceYears} years experience</span>
        </div>
      </div>
    </Card>
  );
}
