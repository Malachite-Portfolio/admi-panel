import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Host } from "@/types";
import { formatInr } from "@/utils/currency";

export function EarningsCard({ host }: { host: Host }) {
  const today = host.hostEarnings * 0.04;
  const weekly = host.hostEarnings * 0.21;
  const monthly = host.hostEarnings * 0.68;

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Earnings & Payouts</CardTitle>
        <CardDescription>
          Revenue split and payout snapshot for this host.
        </CardDescription>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-app-border p-3">
          <p className="text-xs text-app-text-muted">Total Generated Revenue</p>
          <p className="mt-1 text-lg font-semibold">
            {formatInr(host.revenueGenerated)}
          </p>
        </div>
        <div className="rounded-xl border border-app-border p-3">
          <p className="text-xs text-app-text-muted">Host Share</p>
          <p className="mt-1 text-lg font-semibold">{formatInr(host.hostEarnings)}</p>
        </div>
        <div className="rounded-xl border border-app-border p-3">
          <p className="text-xs text-app-text-muted">Platform Commission</p>
          <p className="mt-1 text-lg font-semibold">
            {formatInr(host.platformCommission)}
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-app-border bg-black/20 p-3">
          <p className="text-xs text-app-text-muted">Today</p>
          <p className="mt-1 text-base font-semibold">{formatInr(today)}</p>
        </div>
        <div className="rounded-xl border border-app-border bg-black/20 p-3">
          <p className="text-xs text-app-text-muted">Weekly</p>
          <p className="mt-1 text-base font-semibold">{formatInr(weekly)}</p>
        </div>
        <div className="rounded-xl border border-app-border bg-black/20 p-3">
          <p className="text-xs text-app-text-muted">Monthly</p>
          <p className="mt-1 text-base font-semibold">{formatInr(monthly)}</p>
        </div>
      </div>
    </Card>
  );
}
