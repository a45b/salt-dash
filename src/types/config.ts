import type { WidgetConfig } from "./widgets";

/**
 * Root configuration object for the entire Salt Dash application.
 * Declared once in `src/config/dashboard.config.ts`; the application derives
 * all routing, widget rendering, and data-loading behaviour from this value.
 */
export interface DashboardConfig {
  /** Global UI theme identifier. Passed directly to SaltProvider. Defaults to the Salt DS default theme. */
  theme?: string;
  /** Colour mode for SaltProvider. Defaults to "light". */
  mode?: "light" | "dark";
  /**
   * Named data-source definitions keyed by `dataSourceId`.
   * Every `dataSourceId` referenced by a widget or filter must have a corresponding entry here.
   */
  dataSources: Record<string, DataSourceConfig>;
  /** Ordered list of dashboard pages. Routing is generated from this array. */
  pages: PageConfig[];
}

// ---------------------------------------------------------------------------
// Data source configs (discriminated union on `type`)
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all supported data-source configurations.
 * Use the `type` field to narrow to a specific variant.
 */
export type DataSourceConfig =
  | MockDataSourceConfig
  | ApiDataSourceConfig
  | WebSocketDataSourceConfig;

/** A data source backed by a local JSON mock file. */
export interface MockDataSourceConfig {
  /** Discriminant — must be `"mock"`. */
  type: "mock";
  /** Unique identifier for this data source. Must match the key in `DashboardConfig.dataSources`. */
  dataSourceId: string;
  /** Path to the JSON file relative to the project root (e.g. `"src/data/mock/orders.json"`). */
  filePath: string;
}

/** A data source backed by an HTTP API endpoint. */
export interface ApiDataSourceConfig {
  /** Discriminant — must be `"api"`. */
  type: "api";
  /** Unique identifier for this data source. Must match the key in `DashboardConfig.dataSources`. */
  dataSourceId: string;
  /** Fully-qualified HTTP(S) endpoint URL that returns JSON. */
  endpoint: string;
}

/** A data source backed by a WebSocket connection. */
export interface WebSocketDataSourceConfig {
  /** Discriminant — must be `"websocket"`. */
  type: "websocket";
  /** Unique identifier for this data source. Must match the key in `DashboardConfig.dataSources`. */
  dataSourceId: string;
  /** Fully-qualified WebSocket URL (e.g. `"wss://example.com/stream"`). */
  url: string;
}

// ---------------------------------------------------------------------------
// Page config
// ---------------------------------------------------------------------------

/** Configuration for a single dashboard page. */
export interface PageConfig {
  /** Unique page identifier used internally. Not shown in the UI. */
  pageId: string;
  /**
   * URL path for this page. Must begin with `"/"` and must be unique across all pages.
   * May contain named dynamic segments using `:paramName` syntax
   * (e.g. `"/orders/:orderId"`, `"/reports/:reportId/detail"`).
   * Each `paramName` must be non-empty and contain only alphanumeric characters and underscores.
   */
  path: string;
  /** Human-readable title shown in the page header and document title. */
  title: string;
  /** Number of grid columns for the widget layout (1–24). Defaults to 12. */
  columns?: number;
  /** Optional page header configuration. Renders nothing when absent. */
  header?: HeaderConfig;
  /** Optional breadcrumb trail shown above the page header. */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional filter bar shown above the widget grid. */
  filters?: FilterConfig[];
  /** Ordered list of widgets to render on this page. */
  widgets: WidgetConfig[];
}

// ---------------------------------------------------------------------------
// Header config
// ---------------------------------------------------------------------------

/** Configuration for the page-level header area. */
export interface HeaderConfig {
  /** Primary heading text. */
  title?: string;
  /** Secondary text rendered below the title. */
  subtitle?: string;
  /**
   * Action buttons rendered in the header's action area.
   * Each action dispatches to the application-level action registry on click.
   */
  actions?: HeaderAction[];
}

/** A single action button rendered inside a `HeaderConfig`. */
export interface HeaderAction {
  /** Unique identifier passed to `dispatchAction` when the button is clicked. */
  actionId: string;
  /** Label text displayed on the button. */
  label: string;
  /** Salt DS button variant. Defaults to the Salt DS default variant when absent. */
  variant?: "primary" | "secondary" | "cta";
}

// ---------------------------------------------------------------------------
// Breadcrumb config
// ---------------------------------------------------------------------------

/** A single item in a page's breadcrumb trail. */
export interface BreadcrumbItem {
  /** Visible text for this breadcrumb item. Items with an empty or missing label are omitted. */
  label: string;
  /**
   * Navigation target for this item.
   * When present on a non-last item the breadcrumb renders as a link.
   * The last item in the array is always rendered as plain text, regardless of this field.
   */
  href?: string;
}

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------

/**
 * Configuration for a single filter control rendered in the page's filter bar.
 * Filter state is persisted in URL query parameters keyed by `filterId`.
 */
export interface FilterConfig {
  /** Unique identifier for this filter within the page. Used as the URL query-param key. */
  filterId: string;
  /** The type of filter control to render. */
  type: "select" | "multi-select" | "date-range" | "text-search" | "toggle";
  /** Human-readable label shown above or beside the filter control. */
  label: string;
  /**
   * ID of a data source whose results are used to populate the filter's options dynamically.
   * If absent the filter relies on the static `options` array or requires no data.
   */
  dataSourceId?: string;
  /**
   * Initial value applied when neither the URL query params nor a user interaction
   * has set a value for this filter. Accepts any serialisable value.
   */
  defaultValue?: unknown;
  /** Static options for `select` and `multi-select` controls. Ignored for other types. */
  options?: Array<{ label: string; value: unknown }>;
  /**
   * Names of route params (from the page's dynamic path segments, e.g. `":orderId"`)
   * whose current URL values should be forwarded to this filter's Data_Adapter as fetch params.
   *
   * Example: for a page with `path: "/orders/:orderId"`, setting `routeParams: ["orderId"]`
   * causes the adapter fetch to receive `{ orderId: "<value from URL>" }` as params.
   * A param name listed here that is absent from the current URL is passed as `undefined`.
   */
  routeParams?: string[];
}

// ---------------------------------------------------------------------------
// Widget config (forward reference — defined in src/types/widgets.ts)
// ---------------------------------------------------------------------------

/**
 * Re-export alias so consumers of `config.ts` can import the widget union from
 * a single file.  The canonical definition lives in `src/types/widgets.ts`.
 */
export type { WidgetConfig } from "./widgets";
