import { ArrowUpRight } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/classnames";

type StatCardProps = {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  subValue,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden p-4", className)}>
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-app-accent/10 blur-2xl" />
      <div className="relative">
        <CardDescription className="text-xs uppercase tracking-wider text-app-text-muted">
          {label}
        </CardDescription>
        <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
        <div className="mt-2 flex items-center justify-between">
          {subValue ? (
            <span className="text-xs text-app-text-secondary">{subValue}</span>
          ) : (
            <span />
          )}
          {icon ? (
            <span className="rounded-full bg-app-accent-bg p-2 text-app-accent">
              {icon}
            </span>
          ) : (
            <ArrowUpRight className="h-4 w-4 text-app-accent" />
          )}
        </div>
      </div>
    </Card>
  );
}
