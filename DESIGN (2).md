---
name: Institutional Dark Engineering
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dce6'
  primary: '#e0fdff'
  on-primary: '#00373a'
  primary-container: '#00f2fe'
  on-primary-container: '#006a70'
  inverse-primary: '#00696f'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#f1f8ff'
  on-tertiary: '#00354a'
  tertiary-container: '#b2e1ff'
  on-tertiary-container: '#00678c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ff6ff'
  primary-fixed-dim: '#00dce6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.04em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-compact: 0.5rem
  margin: 1rem
  margin-compact: 0.5rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style

This design system targets quantitative researchers, risk officers, and financial infrastructure engineers orchestrating live algorithmic positions and distributed system configurations. The interface delivers absolute precision, low cognitive drag, and immediate signal detection across multi-monitor telemetry setups.

The visual style synthesizes high-density technical minimalism with restrained sci-fi telemetry aesthetics:
- **Surface Depth:** Deep, non-reflective oceanic navies eliminate optical fatigue in low-light trading pits.
- **Information Density:** Compact vertical cadence, razor-thin structural dividers, and zero superfluous decoration or soft consumer radius work.
- **Signal Hierarchy:** Monochrome background structure punctuated by high-frequency electric cyan and kinetic emerald status indicators, drawing immediate focus to active parameters, delta shifts, and runtime anomalies.

## Colors

The palette is engineered for pure terminal clarity and mission-critical telemetry.

### Palette Architecture
- **Primary Accent (`#00f2fe`):** Focused high-energy cyan for dynamic data deltas, primary focus states, cursor targets, and active instrumentation nodes.
- **Secondary Accent (`#10b981`):** Precision emerald reserved for validated states, positive PnL/yield movements, synchronized cluster nodes, and low-latency health indicators.
- **Tertiary Accent (`#38bdf8`):** Sky cyan for secondary interactive links, active tabs, and informational parameter badges.
- **Neutral Foreground (`#94a3b8`):** Slate for standard key-value descriptors, metadata keys, and deactivated grid channels.

### Surface Hierarchy
- **Canvas Base:** `#0a0e17`
- **Surface Elevation 1 (Card/Panel Container):** `#101622`
- **Surface Elevation 2 (Inspectors/Modals/Floating Trays):** `#182234`
- **Structural Borders & Crosshairs:** `#1e293b` (default structural lines), `#334155` (interactive dividers & focus perimeters)
- **High-Contrast Text:** Primary readout text sits at `#ffffff` with zero opacity dilution for maximum legibility against dark slate tiers.

## Typography

The typographic system utilizes a dual-engine architecture:
- **Inter** handles narrative structure, view headers, action controls, and high-density interface navigation where horizontal tracking and letter-aperture clarity avoid visual collisions.
- **JetBrains Mono** governs live streaming logs, financial calculation outputs, trade matrix arrays, configuration YAML/JSON inspectors, and status tags.

### Rules of Usage
- All numbers, values, and tabular rows must be set in monospaced or tabular numeral configurations (`font-variant-numeric: tabular-nums`).
- Label and micro metadata tokens (`label-sm`, `label-md`) strictly utilize JetBrains Mono in uppercase or tracked notation to cleanly differentiate keys from values.
- Primary values inherit `#ffffff`; accompanying measurement units (e.g., `bps`, `ms`, `USD`) downscale to `label-sm` with `#94a3b8`.

## Layout & Spacing

This design system uses an ultra-compact fluid grid tailored for widescreen multi-panel financial operations:
- **Grid Structure:** Modular 24-column desktop fluid layout with a base rhythm of 4px. Columns collapse into dockable, resizable tiled viewports rather than traditional web marketing containers.
- **Gutters & Spacing:** Strict `0.75rem` (12px) gutter widths on standard desktop telemetry; transitions to `0.5rem` (8px) on auxiliary control drawers and compact sidecar inspectors.
- **Responsive Dynamics:**
  - **Desktop (>= 1440px):** Full modular multi-column dashboard with persistent telemetry rails, code editors, and real-time execution streams.
  - **Tablet (768px - 1439px):** Tiled layout morphs into swipeable segmented split-panes; inspection panels switch to drawer overlays.
  - **Mobile (< 768px):** Single-column stacked metric cards with horizontal scroll tab rails for deep configuration nodes.

## Elevation & Depth

Visual hierarchy is achieved through precision boundary mapping rather than synthetic drop shadows:
- **Base Canvas:** The deepest layer sits at `#0a0e17`.
- **Containers & Tiles:** Module containers use solid `#101622` surfaces framed with explicit 1px `#1e293b` borders. Depth is established through planar containment, never diffuse blur.
- **Inspectors & Flyouts:** Floating elements (dropdown menus, popover tooltips, command palettes) occupy `#182234` bounded by a sharper 1px border of `#334155`.
- **Active Focus & Alerts:** Active focused panes and highlight nodes receive a hard 1px outline of `#00f2fe` or a subtle inner inset edge illumination (`inset 0 0 0 1px #00f2fe`). Diffuse box-shadows are strictly forbidden, preserving pristine pixel alignment across crisp dense matrix tables.

## Shapes

The design system enforces architectural sharpness with tight corner rounding (level `1`):
- Standard cards, tabs, input fields, and metric modules have a precise corner radius of `0.25rem` (4px).
- Internal inner elements (buttons, chip pills, dropdown triggers) maintain matching `0.25rem` rounding to preserve geometric nesting.
- High-level modal trays and global panel wrappers scale to `0.5rem` (8px) max.
- Pill or circular geometry is restricted strictly to binary activity indicator dots (e.g., node alive/dead beacons).

## Components

### Buttons & Interactive Controls
- **Primary Action:** Solid `#00f2fe` fill, `#0a0e17` high-contrast bold typography. Hover shifts brightness upwards to `#38bdf8`. Active downscale to 98% scale.
- **Secondary / Utility Action:** Surface `#182234`, 1px border `#334155`, text `#ffffff`. Hover border transitions to `#00f2fe`.
- **Destructive Action:** Deep crimson surface outline (`#7f1d1d`), text `#f87171`. Focus ring `#ef4444`.
- **Density:** Button height defaults to a compact 28px for tertiary toolbars, 32px for primary layout headers.

### Input Fields & Parameter Controls
- **Background & Border:** Solid `#0a0e17` inset with 1px border `#1e293b`.
- **Focus Mode:** Border immediately changes to `#00f2fe` with an inner 1px glow. Text stays crisp `#ffffff`.
- **Units & Decorators:** Unit tags (`ms`, `μs`, `vol`) pinned inside right border using JetBrains Mono `#94a3b8`.

### Chips & Parameter Badges
- **Structure:** Height 20px, font `label-sm`, padding `0 6px`.
- **Live/Online:** `#064e3b` background with 1px `#10b981` border and `#10b981` text.
- **Warning/Latency:** `#451a03` background with 1px `#f59e0b` border and `#fbbf24` text.
- **Neutral Attribute:** `#182234` background with 1px `#334155` border and `#94a3b8` text.

### Data Tables & Matrix Views
- **Header:** Sticky row on `#0a0e17`, uppercase `label-sm` text in `#94a3b8`, terminated by 1px horizontal border `#1e293b`.
- **Rows:** 28px fixed height, alternating row highlight utilizing subtle `#101622` against `#0e1420`. Hover triggers 1px vertical cyan pip indicator on row start.
- **Cell Content:** Tabular numbers in JetBrains Mono with explicit right alignment for financial metrics.

### Code Blocks & Live Configuration Inspectors
- **Surface:** Embedded `#080b12` background surrounded by 1px `#1e293b` frame.
- **Gutter Lines:** Line numbers set in JetBrains Mono `#475569`, separated by a 1px `#1e293b` vertical hairline divider.
- **Syntax Accents:** Keys in `#38bdf8`, values in `#10b981`, booleans and numbers in `#00f2fe`, comments in `#64748b`.