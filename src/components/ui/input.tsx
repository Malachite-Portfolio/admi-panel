import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/classnames";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-app-border bg-[#140f26] px-3 text-sm text-app-text-primary outline-none transition-all placeholder:text-app-text-muted focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20",
        className,
      )}
      {...props}
    />
  );
}
