import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children, className, ...props }: FormSectionProps) {
  return (
    <section className={cn("rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm sm:p-5", className)} {...props}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
