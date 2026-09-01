import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold tracking-tight transition-colors border",
  {
    variants: {
      variant: {
        default: "border-slate-300 bg-slate-100 text-slate-900 font-bold",
        secondary: "border-blue-200 bg-blue-50 text-blue-900 font-semibold",
        outline: "border-slate-300 bg-white text-slate-800 font-semibold",
        success: "border-emerald-300 bg-emerald-100 text-emerald-950 font-bold",
        warning: "border-amber-300 bg-amber-100 text-amber-950 font-bold",
        destructive: "border-rose-300 bg-rose-100 text-rose-950 font-bold",
        gold: "border-amber-400 bg-amber-100 text-amber-950 font-bold",
        primary: "border-blue-300 bg-blue-100 text-blue-950 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Badge({ className, variant, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
