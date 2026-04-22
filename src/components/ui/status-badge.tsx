import { cn } from "@/utils/classnames";

type StatusType =
  | "pending"
  | "approved"
  | "payment_done"
  | "verified"
  | "rejected"
  | "active"
  | "inactive"
  | "suspended"
  | "blocked"
  | "online"
  | "offline"
  | "busy"
  | "visible"
  | "hidden"
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "critical"
  | "high"
  | "medium"
  | "low";

const STATUS_STYLES: Record<StatusType, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  approved: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
  payment_done: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  verified: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  rejected: "bg-rose-500/20 text-rose-300 border-rose-400/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  inactive: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  suspended: "bg-orange-500/20 text-orange-300 border-orange-400/30",
  blocked: "bg-red-500/20 text-red-300 border-red-400/30",
  online: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  offline: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  busy: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  visible: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30",
  hidden: "bg-zinc-500/20 text-zinc-300 border-zinc-400/30",
  open: "bg-red-500/20 text-red-300 border-red-400/30",
  in_progress: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  closed: "bg-zinc-500/20 text-zinc-300 border-zinc-400/30",
  critical: "bg-red-500/20 text-red-300 border-red-400/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-400/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
  low: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusType | string;
  className?: string;
}) {
  const normalized = status.toLowerCase() as StatusType;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        STATUS_STYLES[normalized] ?? "bg-slate-500/20 text-slate-300 border-slate-400/30",
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
