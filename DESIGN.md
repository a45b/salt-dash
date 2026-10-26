---
name: Salt Dash Institutional
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee9ff'
  surface-container-highest: '#d8e3f9'
  on-surface: '#111c2c'
  on-surface-variant: '#44474d'
  inverse-surface: '#263142'
  inverse-on-surface: '#ebf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#515f7a'
  primary: '#000412'
  on-primary: '#ffffff'
  primary-container: '#0f1e36'
  on-primary-container: '#7886a3'
  inverse-primary: '#b8c7e6'
  secondary: '#45607f'
  on-secondary: '#ffffff'
  secondary-container: '#bddafd'
  on-secondary-container: '#445f7e'
  tertiary: '#000503'
  on-tertiary: '#ffffff'
  tertiary-container: '#002319'
  on-tertiary-container: '#369578'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b8c7e6'
  on-primary-fixed: '#0c1b33'
  on-primary-fixed-variant: '#394761'
  secondary-fixed: '#d0e4ff'
  secondary-fixed-dim: '#adc9ec'
  on-secondary-fixed: '#001d35'
  on-secondary-fixed-variant: '#2d4966'
  tertiary-fixed: '#98f4d3'
  tertiary-fixed-dim: '#7cd8b8'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#00513e'
  background: '#f9f9ff'
  on-background: '#111c2c'
  surface-variant: '#d8e3f9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-metric:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.02em
  data-mono:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-dense: 0.5rem
  margin: 1rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.375rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
This design system is engineered for mission-critical institutional finance, capital markets, wealth operations, and treasury intelligence platforms. It directly implements the architectural principles of salt-tier enterprise design systems: hyper-legibility, structural clarity, high information density, and precise spatial discipline. 

The aesthetic is Modern Institutional: restrained, authoritative, and frictionless. It avoids consumer-grade ornament, hyper-expressive radiuses, or distracting novelty. The interface serves as a high-performance viewport for complex analytical data streams, order books, multi-asset portfolio metrics, and configurable widgets.

Key tenets:
- **Zero Ambiguity:** Strict differentiation between interactive controls, read-only analytical surfaces, and state indicators.
- **Data Dominance:** UI chrome recedes into crisp, calibrated architectural borders (1px slate gridlines), elevating real-time tabular and numerical information.
- **Config-Driven Modularity:** Every container, dock, and card is constructed around deterministic modular units that effortlessly tile, dock, and collapse across multi-monitor trading and operations desks.

## Colors
The color architecture relies on high-contrast institutional slates, deep navy foundations, and unambiguous financial semantic tokens calibrated for continuous 10+ hour workstation use.

### Foundational Palette
- **Primary Navy (`#0F1E36`):** The institutional anchor. Used for primary interactive triggers, active tab indicators, high-emphasis text, and enterprise application headers.
- **Secondary Slate Blue (`#2B4764`):** Intermediate architectural elements, secondary button outlines, column sort headers, and secondary navigational tiers.
- **Tertiary Forest Emerald (`#0D7A5F`):** Standard positive financial movement, gain positions, confirmed settlement states, and compliant validations.
- **Neutral Steel Gray (`#5A6578`):** Precision labels, column metadata, subtle icons, timestamp strings, and disabled foregrounds.

### Semantic & Data Visualization Tokens
- **Positive Indicator:** `#0D7A5F` (Light Mode) / `#10B981` (Dark Mode)
- **Negative Indicator:** `#C5283D` (Light Mode) / `#F43F5E` (Dark Mode)
- **Warning Indicator:** `#B45309` (Light Mode) / `#F59E0B` (Dark Mode)
- **Informational / Neutral Metric:** `#2563EB` (Light Mode) / `#60A5FA` (Dark Mode)

### Recharts Categorical & Series Tokens
- **Series 1 (Primary Benchmark):** `#0F1E36` (Light) / `#60A5FA` (Dark)
- **Series 2 (Active Strategy):** `#0D7A5F` (Light) / `#34D399` (Dark)
- **Series 3 (Comparative Yield):** `#475569` (Light) / `#94A3B8` (Dark)
- **Series 4 (Alternative/Hedge):** `#6366F1` (Light) / `#818CF8` (Dark)
- **Series 5 (Secondary Metric):** `#D97706` (Light) / `#FBBF24` (Dark)

### Dark Enterprise Mode Adaptation
In dark mode, the canvas switches to `#0B0F19`, with container cards surfacing at `#111827`, raised popovers at `#1F2937`, and hairline borders defined at `#374151`. Primary text shifts to `#F9FAFB` with secondary text grounded at `#9CA3AF`.

## Typography
Typographic rhythm is calibrated strictly for high-density financial layouts. The entire system employs `Inter` with OpenType tabular figures (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum" on, "cv05" on`) enabled across all numeric output, grids, KPI readouts, and timestamps to eliminate column jitter during live updates.

- **Scale Compactness:** Base analytical text defaults to `body-md` (13px), standardizing data density across enterprise monitors.
- **Label Discipline:** `label-sm` (11px, weight 600) utilizes micro uppercase treatments for table column headers, status markers, and metric tags.
- **Metrics & KPIs:** Numerical readouts utilize `data-metric` with tight tracking to ensure multi-million and multi-billion integer strings fit cleanly inside constrained widget columns.

## Layout & Spacing
The layout operates on a strict 4px/8px modular grid optimized for dense analytical dashboards. Canvas structures adapt between a fluid 12-column widget framework and an institutional master-detail split layout.

### Breakpoints & Canvas Logic
- **Mobile (< 768px):** Single-column stacked widgets; horizontal scroll for tabular matrices; outer canvas margin `0.75rem`.
- **Tablet / Small Workstation (768px - 1279px):** 6-column grid; KPI bands flow 2-up or 3-up; gutter `0.75rem`.
- **Desktop Enterprise (1280px - 1919px):** 12-column fluid grid; default gutter `0.75rem`; section margin `1rem`.
- **Ultra-Wide Financial Operations (>= 1920px):** 16-to-24 column dynamic widget docks; compact `gutter-dense` (0.5rem) mode toggleable for trading desk density.

Components leverage `space-xs` (4px) and `space-sm` (6px) internal cell paddings to pack analytical clarity into compact screen real estate.

## Elevation & Depth
In alignment with institutional salt design criteria, visual separation is primarily achieved through crisp 1px structural hairline borders rather than heavy atmospheric shadows.

- **Flat Architectural Tiering:** Base canvas sits at ground zero. Content cards, toolbars, and datagrids reside on standard surface levels bordered by `1px solid #E2E8F0` (Light) or `1px solid #1E293B` (Dark).
- **Subtle Surface Tiers:** Backgrounds progress subtly (`#FFFFFF` on `#F8FAFC` in light mode; `#111827` on `#0B0F19` in dark mode).
- **Elevated Controls (Flyouts, Menus, Modals):** Elevation is reserved strictly for detached contextual surfaces (dropdown select lists, date-range flyouts, config modals). These utilize clean, low-blur drop shadows:
  - Contextual Menus: `0px 4px 12px rgba(15, 30, 54, 0.08)`
  - Critical Dialogue Windows: `0px 12px 32px rgba(15, 30, 54, 0.16)`
- **Hover & Active Depths:** No 3D extrusions or tactile push effects. Active and focus states utilize high-contrast 2px focus rings (`#2563EB`) offset by 1px to preserve accessibility standards.

## Shapes
This system uses a disciplined **Soft (`1`)** shape geometry. 
- Base inputs, buttons, table cell selections, and micro badges utilize `0.25rem` (4px) corner radii.
- Standard container cards, panel headers, and modal frameworks utilize `0.5rem` (8px, `rounded-lg`).
- Zero circular/pill-shaped components are permitted for enterprise tools; interactive buttons and tags maintain strict rectilinear structure to maximize horizontal and vertical scanning efficiency across dense grids.

## Components

### Buttons
- **Primary:** Background `#0F1E36`, foreground `#FFFFFF`, border `1px solid transparent`, corner radius 4px. Height: 32px (Compact/Default) or 28px (Dense). Font: `label-md`. Hover: `#1E3A5F`. Focus: 2px ring `#2563EB`.
- **Secondary / Outline:** Background `#FFFFFF`, foreground `#0F1E36`, border `1px solid #CBD5E1`. Hover: `#F8FAFC` with border `#94A3B8`.
- **Tertiary / Ghost:** Background transparent, foreground `#2B4764`, zero border. Hover: `#F1F5F9`.

### Data Grids & Tables
- **Header Cells:** Height 32px, background `#F8FAFC` (Light) or `#111827` (Dark), typography `label-sm` uppercase, color `#5A6578`. 1px bottom border `#CBD5E1`. Sort indicators aligned 4px from header label.
- **Data Rows:** Height 36px standard (28px dense mode). Bottom border `1px solid #E2E8F0`. Hover row state: `#F1F5F9`. Numeric values aligned right with tabular figures enabled. Selected row: `#EFF6FF` with `2px solid #2563EB` left accent border.

### KPI & Metric Cards
- **Container:** White background, 1px border `#E2E8F0`, 8px padding internal, corner radius 8px.
- **Title:** `label-sm` in `#5A6578`.
- **Primary Value:** `data-metric` typography, `#0F1E36`.
- **Delta Indicator:** Compact badge or inline label with directional arrow glyph (`▲`/`▼`), utilizing `#0D7A5F` for positive gains, `#C5283D` for negative variances, accompanied by small comparative timeframe text (`vs. prior day`) in `body-sm`.

### Input Fields & Selectors
- **Input Containers:** Height 32px standard, border `1px solid #CBD5E1`, background `#FFFFFF`, font `body-md`. Padding: `0 8px`. Focus: border `#2563EB`, subtle 1px ring `#2563EB`.
- **Compact Selectors:** Native-styled custom dropdowns with right-aligned chevron, height 28px for toolbar placement.

### Chips & Status Badges
- **Structure:** Height 20px, horizontal padding 6px, radius 4px, font `label-sm`.
- **Success:** Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Critical / Danger:** Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`.
- **Neutral / Pending:** Background `#F1F5F9`, text `#334155`, border `1px solid #CBD5E1`.

### Recharts & Data Visualization Wrappers
- **Chart Card Shell:** Standard card container with clear header bar containing metric title, aggregation interval toggle (1D, 1W, 1M, YTD), and export action.
- **Grid Lines:** Stroke `#E2E8F0` (Light) / `#1E293B` (Dark), strokeDasharray `3 3`.
- **Tooltip Popover:** Background `#0F1E36`, text `#FFFFFF`, radius 4px, padding 8px 12px, box-shadow `0 4px 6px -1px rgba(0,0,0,0.1)`, `data-mono` font configuration.