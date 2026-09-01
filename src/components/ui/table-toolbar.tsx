import { ChevronDown, Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface TableToolbarProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function TableToolbar({ title, description, children, action, className }: TableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        {title ? <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</h3> : null}
        {description ? <p className="text-[11px] text-slate-600 font-medium mt-0.5">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {action}
      </div>
    </div>
  );
}

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <label className={cn("flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs focus-within:border-slate-800 transition-colors", className)}>
      <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      <input
        type="search"
        className="w-full border-0 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 font-medium"
        {...props}
      />
    </label>
  );
}

interface FilterDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  className?: string;
}

export function FilterDropdown({ label, className, children, ...props }: FilterDropdownProps) {
  return (
    <label className={cn("flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs", className)}>
      {label ? <span className="whitespace-nowrap font-bold text-slate-800">{label}:</span> : null}
      <div className="relative flex-1">
        <select className="w-full appearance-none bg-transparent pr-5 text-xs text-slate-900 font-medium outline-none cursor-pointer" {...props}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
      </div>
    </label>
  );
}
