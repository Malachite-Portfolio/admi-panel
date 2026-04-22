import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/classnames";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-app-border bg-[#140f26] px-3 text-sm text-app-text-primary outline-none transition-all focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20",
        className,
      )}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
