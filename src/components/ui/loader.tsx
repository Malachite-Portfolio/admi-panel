import { cn } from "@/utils/classnames";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-app-accent/40 border-t-app-accent",
        className,
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader className="h-10 w-10 border-4" />
    </div>
  );
}
