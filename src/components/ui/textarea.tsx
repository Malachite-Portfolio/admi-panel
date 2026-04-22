import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/classnames";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-app-border bg-[#140f26] px-3 py-2 text-sm text-app-text-primary outline-none transition-all placeholder:text-app-text-muted focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20",
        className,
      )}
      {...props}
    />
  );
}
