import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "emerald" | "amber";
  className?: string;
}

export function StatCard({ title, value, change, icon, variant = "default", className }: StatCardProps) {
  const borderVariants = {
    default: "border-t-2 border-t-slate-400",
    primary: "border-t-2 border-t-slate-900",
    emerald: "border-t-2 border-t-emerald-600",
    amber: "border-t-2 border-t-amber-600",
  };

  return (
    <Card className={cn("overflow-hidden border border-slate-200 bg-white shadow-xs", borderVariants[variant], className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{title}</p>
          {icon ? <div className="text-slate-600">{icon}</div> : null}
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-tabular">
            {value}
          </span>
        </div>
        {change ? (
          <p className="mt-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-2">
            {change}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
