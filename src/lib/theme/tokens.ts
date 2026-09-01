/**
 * RecoNepal — Design System Tokens
 *
 * Centralized TypeScript mirror of the CSS custom properties defined in
 * `src/app/globals.css`. Use these constants from JS/TS code (e.g. charts,
 * canvas, dynamic styles) so the design system stays the single source of truth.
 */

export const tokens = {
  color: {
    brand: {
      50: "#ecfafb",
      100: "#d2f3f4",
      200: "#a6e7ea",
      300: "#6fd6da",
      400: "#3bc1c6",
      500: "#18a2a4",
      600: "#138b8d",
      700: "#0f6e70",
      800: "#0c5658",
      900: "#093f41",
    },
    accent: {
      50: "#eef4fb",
      100: "#d4e2f3",
      200: "#a8c3e6",
      300: "#7ba5d8",
      400: "#4f87cb",
      500: "#2a6bb8",
      600: "#0f4c81",
      700: "#0b3b66",
      800: "#082b4d",
      900: "#051c33",
    },
    neutral: {
      0: "#ffffff",
      50: "#f7f9fc",
      100: "#eef2f7",
      200: "#e1e7ef",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1f2937",
      900: "#0f172a",
      950: "#07111f",
    },
    success: { 50: "#ecfdf5", 100: "#d1fae5", 500: "#10b981", 600: "#059669", 700: "#047857" },
    warning: { 50: "#fffbeb", 100: "#fef3c7", 500: "#f59e0b", 600: "#d97706", 700: "#b45309" },
    danger: { 50: "#fef2f2", 100: "#fee2e2", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c" },
    info: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
  },
  radius: {
    xs: "0.375rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
  shadow: {
    xs: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
    sm: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
    md: "0 6px 16px -8px rgba(15, 23, 42, 0.12), 0 2px 6px -2px rgba(15, 23, 42, 0.06)",
    lg: "0 20px 40px -20px rgba(15, 76, 129, 0.18), 0 6px 14px -8px rgba(15, 23, 42, 0.08)",
    xl: "0 30px 60px -25px rgba(15, 76, 129, 0.22), 0 12px 24px -12px rgba(15, 23, 42, 0.10)",
  },
  font: {
    sans: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    display: "Inter, 'Segoe UI', system-ui, sans-serif",
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
  },
} as const;

export type Tokens = typeof tokens;

/** @deprecated Use the typed `tokens` export instead. */
export const themeTokens = {
  colors: tokens.color,
  radius: tokens.radius,
  shadow: tokens.shadow,
  font: tokens.font,
  spacing: tokens.spacing,
};
