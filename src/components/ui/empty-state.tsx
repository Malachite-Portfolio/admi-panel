import { Inbox } from "lucide-react";
import { cn } from "@/utils/classnames";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card flex flex-col items-center justify-center rounded-2xl border border-dashed border-app-border p-8 text-center",
        className,
      )}
    >
      <div className="mb-3 rounded-full bg-app-accent-bg p-3">
        <Inbox className="h-5 w-5 text-app-accent" />
      </div>
      <p className="font-semibold text-app-text-primary">{title}</p>
      <p className="mt-1 max-w-md text-sm text-app-text-secondary">{description}</p>
    </div>
  );
}
