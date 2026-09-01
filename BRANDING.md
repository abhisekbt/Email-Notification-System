# Application Branding — RecoNepal

This document captures the application identity, logo system, and recommended
favicon so the brand stays consistent across web, docs, and marketing surfaces.

## Application name
- **Primary**: RecoNepal
- **Product**: Notification System
- **Full lockup**: RecoNepal · Notification System

## Logo system
The brand mark is a geometric monogram built from a rounded square and a
stylised "F" formed by three horizontal bars anchored to a vertical stem.
The mark is intentionally compact, financial, and works in small UI contexts
such as the sidebar, navbar, browser tab, and email signatures.

Components live in `src/components/brand/`:
- `LogoMark` — the monogram only
- `Logo` — full lockup with sizing and layout variants
- `AppTitle` — typographic title block

## Color usage
The brand palette is defined in `src/app/globals.css` and mirrored in
`src/lib/theme/tokens.ts`.

### Primary (teal)
- Use for primary actions, active states, brand accents, and links.
- Default: `var(--brand-600)` / `#138b8d`.
- Hover: `var(--brand-700)` / `#0f6e70`.
- Soft surfaces: `var(--brand-50)` / `#ecfafb`.

### Accent (deep navy)
- Use for headers, navigation, charts, and authority moments.
- Default: `var(--accent-600)` / `#0f4c81`.
- Soft surfaces: `var(--accent-50)` / `#eef4fb`.

### Neutral (slate)
- Use for text, surfaces, borders, and chrome.
- Body text: `var(--neutral-900)` / `#0f172a` in light mode.
- Muted text: `var(--neutral-600)` / `#475569`.
- Surfaces: `var(--neutral-0)` / `#ffffff` (light), `var(--neutral-900)` / `#0f172a` (dark).

### Status
- Success: `var(--success-500)` / `#10b981`
- Warning: `var(--warning-500)` / `#f59e0b`
- Danger: `var(--danger-500)` / `#ef4444`
- Info: `var(--info-500)` / `#3b82f6`

## Typography
- Sans: Inter
- Mono: JetBrains Mono
- Display headings: Inter (semibold or bold)

## Favicon suggestion
Recommended favicon (32×32, scalable to 16×16):
- Background: rounded square gradient from `#138b8d` → `#0f4c81`.
- Foreground: white geometric "F" matching the monogram in `LogoMark`.

Suggested files:
- `app/icon.svg` — modern browsers, scalable.
- `app/apple-icon.png` — 180×180 for iOS home screen.
- `app/favicon.ico` — 32×32 fallback.

## Usage rules
- Maintain clear space equal to 1× the mark height on all sides.
- Do not recolor the mark outside the defined palette.
- Do not stretch or skew the mark.
- Do not place the mark on busy backgrounds without a surface container.
