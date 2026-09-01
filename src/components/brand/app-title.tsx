import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface AppTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override the primary line (defaults to "RecoNepal"). */
  primary?: string;
  /** Override the secondary line (defaults to "Notification System"). */
  secondary?: string;
  /** When true, hides the secondary line. */
  hideSecondary?: boolean;
  /** Visual emphasis of the primary line. */
  emphasis?: "default" | "strong" | "subtle";
}

const emphasisMap = {
  default: "text-foreground",
  strong: "text-foreground font-semibold",
  subtle: "text-muted-foreground",
} as const;

/**
 * Application title block used in headers, sidebars, and auth screens.
 */
export function AppTitle({
  primary = "RecoNepal",
  secondary = "Notification System",
  hideSecondary,
  emphasis = "default",
  className,
  ...props
}: AppTitleProps) {
  return (
    <div className={cn("flex flex-col leading-tight", className)} {...props}>
      <span className={cn("text-sm font-semibold tracking-tight", emphasisMap[emphasis])}>
        {primary}
      </span>
      {!hideSecondary ? (
        <span className="text-xs text-muted-foreground">{secondary}</span>
      ) : null}
    </div>
  );
}
