import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface LogoMarkProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  variant?: "gradient" | "solid" | "mono";
  className?: string;
}

/**
 * RecoNepal Assurance Crest.
 * Authoritative geometric emblem representing balance, compliance, and fiduciary trust.
 */
export const LogoMark = React.forwardRef<SVGSVGElement, LogoMarkProps>(function LogoMark(
  { size = 32, variant = "gradient", className, ...props },
  ref
) {
  const fills: Record<NonNullable<LogoMarkProps["variant"]>, { bg: string; fg: string; accent: string }> = {
    gradient: { bg: "url(#ca-crest-gradient)", fg: "#ffffff", accent: "#3b82f6" },
    solid: { bg: "#1d4ed8", fg: "#ffffff", accent: "#60a5fa" },
    mono: { bg: "currentColor", fg: "currentColor", accent: "currentColor" },
  };

  const palette = fills[variant];

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="RecoNepal Chartered Accountants"
      className={cn("inline-block shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="ca-crest-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Structural Shield / Seal */}
      <rect x="1" y="1" width="30" height="30" rx="4" fill={palette.bg} stroke="#3b82f6" strokeWidth="1" />
      {/* Precision Balance & Assurance Glyphs */}
      <path
        d="M8 8h10.5a5.5 5.5 0 0 1 0 11H12v5H8V8Zm4 4v3h6.5a1.5 1.5 0 0 0 0-3H12Z"
        fill={palette.fg}
      />
      <circle cx="23" cy="23" r="2.5" fill={palette.accent} />
      <path d="M16 19l6.5 5" stroke={palette.fg} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
});
