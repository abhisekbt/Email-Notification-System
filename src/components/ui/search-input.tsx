import { Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <label className={cn("flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm", className)}>
      <Search className="h-4 w-4" />
      <input
        type="search"
        className="w-full border-0 bg-transparent outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </label>
  );
}
