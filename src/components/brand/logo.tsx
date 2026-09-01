import * as React from "react";

import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "compact" | "stacked";
  withMark?: boolean;
  className?: string;
}

const sizes: Record<NonNullable<LogoProps["size"]>, { mark: number; title: string; subtitle: string }> = {
  sm: { mark: 26, title: "text-xs font-bold tracking-tight", subtitle: "text-[9px] tracking-wider uppercase font-semibold" },
  md: { mark: 34, title: "text-sm font-bold tracking-tight", subtitle: "text-[10px] tracking-widest uppercase font-semibold" },
  lg: { mark: 42, title: "text-base font-bold tracking-tight", subtitle: "text-xs tracking-widest uppercase font-semibold" },
  xl: { mark: 50, title: "text-lg font-bold tracking-tight", subtitle: "text-xs tracking-widest uppercase font-semibold" },
};

/**
 * RecoNepal Institutional Lockup for Chartered Accountants.
 */
export function Logo({ size = "md", variant = "default", withMark = true, className }: LogoProps) {
  const { mark, title, subtitle } = sizes[size];

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-2.5", className)}>
        {withMark ? <LogoMark size={mark} /> : null}
        <div className="flex flex-col">
          <span className={cn("text-foreground font-semibold uppercase tracking-wider", title)}>
            RecoNepal
          </span>
          <span className={cn("text-muted-foreground", subtitle)}>Chartered Accountants</span>
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("inline-flex flex-col items-center gap-2", className)}>
        {withMark ? <LogoMark size={mark} /> : null}
        <div className="text-center">
          <p className={cn("font-bold uppercase tracking-wider text-foreground", title)}>RecoNepal &amp; Co.</p>
          <p className={cn("text-amber-600 dark:text-amber-400 font-medium", subtitle)}>Chartered Accountants</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {withMark ? <LogoMark size={mark} /> : null}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={cn("font-bold tracking-tight text-foreground", title)}>RECONEPAL</span>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 px-1 py-0.2 rounded-xs">CA</span>
        </div>
        <p className={cn("text-muted-foreground font-medium", subtitle)}>Regulatory &amp; Assurance Practice</p>
      </div>
    </div>
  );
}
