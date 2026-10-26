/**
 * Config validation for Salt Dash.
 *
 * `validateConfig` runs synchronously before any route rendering. It accepts
 * an unknown value (the raw import from `dashboard.config.ts`) and returns a
 * discriminated `ValidationResult`:
 *
 *   - `{ valid: true,  config: DashboardConfig }` — the cleaned, type-safe config.
 *   - `{ valid: false, errors: ValidationError[] }` — one or more fatal errors.
 *
 * Fatal errors prevent the app from rendering any routes; the caller should
 * show a `FatalErrorScreen` instead.
 *
 * Non-fatal errors (duplicate paths, out-of-bounds spans, etc.) are logged to
 * `console.warn` / `console.error` and the offending entry is skipped or
 * capped; the function still returns `valid: true` with a cleaned config.
 */

import type { DashboardConfig, DataSourceConfig, PageConfig } from "../types/config";
import type { WidgetConfig } from "../types/widgets";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ValidationError {
  /** Dot-path to the invalid field (e.g. `"pages[2].path"`). */
  path: string;
  /** Human-readable description of the problem. */
  message: string;
}

export type ValidationResult =
  | { valid: true; config: DashboardConfig }
  | { valid: false; errors: ValidationError[] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when `value` is a non-null plain object. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Returns true when `value` is a non-empty string. */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// ---------------------------------------------------------------------------
// Widget-level validation helpers
// ---------------------------------------------------------------------------

/**
 * Validates a single widget entry.
 *
 * Non-fatal issues (missing widgetId, out-of-bounds colSpan / rowSpan) are
 * handled by skipping or capping the value and logging to the console.
 *
 * @param raw       The raw widget object from config.
 * @param pageIdx   Index of the page (for log messages).
 * @param widgetIdx Index of the widget within the page (for log messages).
 * @param columns   The effective column count for the page (1–24).
 * @returns The cleaned `WidgetConfig`, or `null` if the widget must be skipped.
 */
function validateWidget(
  raw: unknown,
  pageIdx: number,
  widgetIdx: number,
  columns: number
): WidgetConfig | null {
  if (!isObject(raw)) {
    console.error(
      `pages[${pageIdx}].widgets[${widgetIdx}]: widget entry is not an object — skipping.`
    );
    return null;
  }

  // Non-empty widgetId is required (Requirement 3.5 / task 3.1 point 7).
  if (!isNonEmptyString(raw.widgetId)) {
    console.error(
      `pages[${pageIdx}].widgets[${widgetIdx}]: missing or empty "widgetId" — skipping widget.`
    );
    return null;
  }

  // widgetType should be a string; unknown types are allowed (handled at render time).
  const widgetType =
    typeof raw.widgetType === "string" ? raw.widgetType : "unknown";

  // colSpan: must be 1–columns if present; cap to columns when exceeded (non-fatal, Req 2.6).
  let colSpan: number | undefined;
  if (raw.colSpan !== undefined) {
    const raw_colSpan = Number(raw.colSpan);
    if (!Number.isInteger(raw_colSpan) || raw_colSpan < 1) {
      console.warn(
        `pages[${pageIdx}].widgets[${widgetIdx}] (widgetId="${raw.widgetId}"): ` +
          `"colSpan" must be a positive integer — value ${String(raw.colSpan)} ignored; ` +
          `default will be applied.`
      );
      // Leave colSpan as undefined (component will use its own default).
    } else if (raw_colSpan > columns) {
      console.warn(
        `pages[${pageIdx}].widgets[${widgetIdx}] (widgetId="${raw.widgetId}"): ` +
          `"colSpan" value ${raw_colSpan} exceeds page column count ${columns} — capping to ${columns}.`
      );
      colSpan = columns;
    } else {
      colSpan = raw_colSpan;
    }
  }

  // rowSpan: must be 1–100 if present; cap at 100 (non-fatal, Req 2.2).
  let rowSpan: number | undefined;
  if (raw.rowSpan !== undefined) {
    const raw_rowSpan = Number(raw.rowSpan);
    if (!Number.isInteger(raw_rowSpan) || raw_rowSpan < 1) {
      console.warn(
        `pages[${pageIdx}].widgets[${widgetIdx}] (widgetId="${raw.widgetId}"): ` +
          `"rowSpan" must be a positive integer — value ${String(raw.rowSpan)} ignored; ` +
          `default will be applied.`
      );
      // Leave rowSpan as undefined (component will use its own default).
    } else if (raw_rowSpan > 100) {
      console.warn(
        `pages[${pageIdx}].widgets[${widgetIdx}] (widgetId="${raw.widgetId}"): ` +
          `"rowSpan" value ${raw_rowSpan} exceeds maximum of 100 — capping to 100.`
      );
      rowSpan = 100;
    } else {
      rowSpan = raw_rowSpan;
    }
  }

  // Build base fields common to all widget configs.
  const base: Record<string, unknown> = {
    widgetId: raw.widgetId,
    widgetType,
    ...(raw.dataSourceId !== undefined && { dataSourceId: raw.dataSourceId }),
    ...(colSpan !== undefined && { colSpan }),
    ...(rowSpan !== undefined && { rowSpan }),
    ...(Array.isArray(raw.routeParams) && { routeParams: raw.routeParams }),
  };

  // Forward all other type-specific fields through unchanged.
  // The discriminated-union cast is safe because widgetType acts as the
  // discriminant and is validated at render time.
  const widget: Record<string, unknown> = { ...raw, ...base };

  return widget as unknown as WidgetConfig;
}

// ---------------------------------------------------------------------------
// Page-level validation helper
// ---------------------------------------------------------------------------

/**
 * Validates a single page entry, returning a cleaned `PageConfig` or `null`
 * (with an appropriate console.error) when required fields are missing.
 *
 * Duplicate widget IDs within the page are deduplicated (first-wins) with a
 * console.warn per duplicate.
 */
function validatePage(raw: unknown, pageIdx: number): PageConfig | null {
  if (!isObject(raw)) {
    console.error(`pages[${pageIdx}]: page entry is not an object — skipping.`);
    return null;
  }

  // --- Required fields (fatal at page level, non-fatal at config level) ---
  const missingFields: string[] = [];
  if (!isNonEmptyString(raw.path)) missingFields.push("path");
  if (!isNonEmptyString(raw.title)) missingFields.push("title");
  if (!isNonEmptyString(raw.pageId)) missingFields.push("pageId");

  if (missingFields.length > 0) {
    console.error(
      `pages[${pageIdx}]: missing required field(s): ${missingFields.join(", ")} — skipping page entry.`
    );
    return null;
  }

  // TypeScript narrowing: we know these are non-empty strings now.
  const path = raw.path as string;
  const title = raw.title as string;
  const pageId = raw.pageId as string;

  // --- columns: must be 1–24 if present (non-fatal, Req 2.1) ---
  let columns: number | undefined;
  if (raw.columns !== undefined) {
    const rawCols = Number(raw.columns);
    if (!Number.isInteger(rawCols) || rawCols < 1 || rawCols > 24) {
      console.warn(
        `pages[${pageIdx}] (pageId="${pageId}"): "columns" value ${String(raw.columns)} ` +
          `is outside the 1–24 range — using default (12).`
      );
      // Leave columns undefined so the rendering layer uses its default (12).
    } else {
      columns = rawCols;
    }
  }

  // Effective column count used for widget span capping.
  const effectiveColumns = columns ?? 12;

  // --- Validate and deduplicate widgets ---
  const rawWidgets = Array.isArray(raw.widgets) ? raw.widgets : [];
  const seenWidgetIds = new Set<string>();
  const cleanedWidgets: WidgetConfig[] = [];

  for (let wIdx = 0; wIdx < rawWidgets.length; wIdx++) {
    const widget = validateWidget(rawWidgets[wIdx], pageIdx, wIdx, effectiveColumns);
    if (widget === null) continue;

    if (seenWidgetIds.has(widget.widgetId)) {
      console.warn(
        `pages[${pageIdx}] (pageId="${pageId}"): duplicate widgetId "${widget.widgetId}" ` +
          `at index ${wIdx} — keeping only the first occurrence.`
      );
      continue;
    }

    seenWidgetIds.add(widget.widgetId);
    cleanedWidgets.push(widget);
  }

  // Assemble the cleaned PageConfig. Forward optional fields as-is.
  const page: PageConfig = {
    pageId,
    path,
    title,
    widgets: cleanedWidgets,
    ...(columns !== undefined && { columns }),
    ...(isObject(raw.header) && { header: raw.header as PageConfig["header"] }),
    ...(Array.isArray(raw.breadcrumbs) && { breadcrumbs: raw.breadcrumbs as PageConfig["breadcrumbs"] }),
    ...(Array.isArray(raw.filters) && { filters: raw.filters as PageConfig["filters"] }),
  };

  return page;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Validates a raw (unknown) config value and returns a `ValidationResult`.
 *
 * **Fatal errors** (returned as `{ valid: false, errors }`)
 * - Config is not a plain object.
 * - `dataSources` field is absent or not a plain object.
 * - `pages` field is absent or not an array.
 *
 * **Non-fatal errors** (logged; offending entry skipped or capped)
 * - Page entry missing `path`, `title`, or `pageId`.
 * - Duplicate `path` or `pageId` across pages.
 * - Duplicate `dataSourceId` in the `dataSources` map.
 * - Page `columns` outside 1–24.
 * - Widget `colSpan` > page column count (capped).
 * - Widget `rowSpan` > 100 (capped).
 * - Widget missing or empty `widgetId`.
 * - Duplicate `widgetId` within a page (first-wins).
 *
 * When ALL pages fail non-fatal validation (e.g. all missing required fields),
 * the function still returns `{ valid: true, config }` with an empty `pages`
 * array so the app can display the `EmptyConfigScreen`.
 */
export function validateConfig(raw: unknown): ValidationResult {
  const fatalErrors: ValidationError[] = [];

  // -------------------------------------------------------------------------
  // Fatal check 1: config must be a plain object
  // -------------------------------------------------------------------------
  if (!isObject(raw)) {
    fatalErrors.push({
      path: "(root)",
      message: `Config must be a plain object, got: ${raw === null ? "null" : typeof raw}`,
    });
    return { valid: false, errors: fatalErrors };
  }

  // -------------------------------------------------------------------------
  // Fatal check 2: dataSources must be present and a plain object
  // -------------------------------------------------------------------------
  if (raw.dataSources === undefined) {
    fatalErrors.push({
      path: "dataSources",
      message: `Required field "dataSources" is missing.`,
    });
  } else if (!isObject(raw.dataSources)) {
    fatalErrors.push({
      path: "dataSources",
      message: `"dataSources" must be an object mapping dataSourceId keys to data source configs, got: ${typeof raw.dataSources}`,
    });
  }

  // -------------------------------------------------------------------------
  // Fatal check 3: pages must be present and an array
  // -------------------------------------------------------------------------
  if (raw.pages === undefined) {
    fatalErrors.push({
      path: "pages",
      message: `Required field "pages" is missing.`,
    });
  } else if (!Array.isArray(raw.pages)) {
    fatalErrors.push({
      path: "pages",
      message: `"pages" must be an array, got: ${typeof raw.pages}`,
    });
  }

  if (fatalErrors.length > 0) {
    return { valid: false, errors: fatalErrors };
  }

  // From here on raw is guaranteed to have an object dataSources and array pages.
  const rawDataSources = raw.dataSources as Record<string, unknown>;
  const rawPages = raw.pages as unknown[];

  // -------------------------------------------------------------------------
  // Validate dataSources — deduplicate by dataSourceId (non-fatal)
  // -------------------------------------------------------------------------
  const seenDataSourceIds = new Set<string>();
  const cleanedDataSources: Record<string, DataSourceConfig> = {};

  for (const key of Object.keys(rawDataSources)) {
    const ds = rawDataSources[key];
    if (!isObject(ds)) {
      console.error(
        `dataSources["${key}"]: entry is not an object — skipping.`
      );
      continue;
    }

    // Determine the dataSourceId: prefer the explicit field, fall back to the map key.
    const dsId =
      typeof ds.dataSourceId === "string" && ds.dataSourceId.trim().length > 0
        ? ds.dataSourceId
        : key;

    if (seenDataSourceIds.has(dsId)) {
      console.error(
        `dataSources: duplicate dataSourceId "${dsId}" — keeping only the first occurrence.`
      );
      continue;
    }

    seenDataSourceIds.add(dsId);
    cleanedDataSources[key] = ds as unknown as DataSourceConfig;
  }

  // -------------------------------------------------------------------------
  // Validate pages — deduplicate by path and pageId (non-fatal)
  // -------------------------------------------------------------------------
  const seenPaths = new Set<string>();
  const seenPageIds = new Set<string>();
  const cleanedPages: PageConfig[] = [];

  for (let i = 0; i < rawPages.length; i++) {
    const page = validatePage(rawPages[i], i);
    if (page === null) continue;

    // Duplicate path check (Requirement 1.6)
    if (seenPaths.has(page.path)) {
      console.error(
        `pages[${i}] (pageId="${page.pageId}"): duplicate path "${page.path}" — ` +
          `keeping only the first occurrence.`
      );
      continue;
    }

    // Duplicate pageId check (Requirement 1.6)
    if (seenPageIds.has(page.pageId)) {
      console.error(
        `pages[${i}] (path="${page.path}"): duplicate pageId "${page.pageId}" — ` +
          `keeping only the first occurrence.`
      );
      continue;
    }

    seenPaths.add(page.path);
    seenPageIds.add(page.pageId);
    cleanedPages.push(page);
  }

  // -------------------------------------------------------------------------
  // Assemble cleaned config
  // -------------------------------------------------------------------------
  const config: DashboardConfig = {
    dataSources: cleanedDataSources,
    pages: cleanedPages,
    ...(typeof raw.theme === "string" && { theme: raw.theme }),
    ...(
      (raw.mode === "light" || raw.mode === "dark") && { mode: raw.mode }
    ),
  };

  return { valid: true, config };
}
