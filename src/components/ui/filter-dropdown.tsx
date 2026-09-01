import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface FilterDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  className?: string;
}

export function FilterDropdown({ label, className, children, ...props }: FilterDropdownProps) {
  return (
    <label className={cn("flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm", className)}>
      {label ? <span className="whitespace-nowrap text-foreground">{label}</span> : null}
      <div className="relative flex-1">
        <select className="w-full appearance-none bg-transparent pr-6 outline-none" {...props}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2" />
      </div>
    </label>
  );
}
