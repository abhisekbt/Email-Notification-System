import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, action, className }: PageHeaderProps) {
  const actionContent = actions ?? action;
  return (
    <div className={cn("flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-slate-600 font-medium">{description}</p> : null}
      </div>
      {actionContent ? <div className="flex items-center gap-2">{actionContent}</div> : null}
    </div>
  );
}
