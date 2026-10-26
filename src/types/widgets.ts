/**
 * Widget config type definitions for Salt Dash.
 * All widget configs extend BaseWidgetConfig and are collected in the
 * WidgetConfig discriminated union, keyed on the `widgetType` literal.
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * A single column definition used by TableWidgetConfig.
 */
export interface ColumnDef {
  /** The data field name this column reads from. */
  field: string;
  /** Human-readable column header label. */
  headerName: string;
}

// ---------------------------------------------------------------------------
// Base config
// ---------------------------------------------------------------------------

/**
 * Fields shared by every widget config type.
 */
export interface BaseWidgetConfig {
  /** Unique identifier for this widget instance within its page. */
  widgetId: string;

  /**
   * The widget type key. Used as the discriminant in the WidgetConfig union
   * and to look up the component in the widget registry.
   */
  widgetType: string;

  /**
   * Optional reference to a named data source defined in the top-level
   * `dataSources` config map. When absent, the widget renders with no
   * external data.
   */
  dataSourceId?: string;

  /**
   * Column span within the page's CSS grid (1 – page column count).
   * Default: 6.
   */
  colSpan?: number;

  /**
   * Row span within the page's CSS grid (1–100).
   * Default: 1.
   */
  rowSpan?: number;

  /**
   * Names of route params from the page's dynamic path segments that should
   * be forwarded to this widget's Data_Adapter as fetch params.
   * For example, `["orderId"]` for a page with path `/orders/:orderId`.
   */
  routeParams?: string[];
}

// ---------------------------------------------------------------------------
// Chart widget
// ---------------------------------------------------------------------------

/**
 * Configuration for a chart widget.
 * Renders a chart of the specified `chartType` using data from the referenced
 * data source.
 */
export interface ChartWidgetConfig extends BaseWidgetConfig {
  /** Discriminant — must be `"chart"`. */
  widgetType: "chart";

  /**
   * The type of chart to render.
   * Supported values: `"bar"`, `"line"`, `"pie"`, `"area"`, `"scatter"`.
   */
  chartType: "bar" | "line" | "pie" | "area" | "scatter";

  /**
   * Data field to map to the horizontal (X) axis.
   * Not required when `chartType` is `"pie"`; ignored without error if
   * provided for a pie chart.
   */
  xField?: string;

  /**
   * Data field to map to the vertical (Y) axis.
   * Not required when `chartType` is `"pie"`; ignored without error if
   * provided for a pie chart.
   */
  yField?: string;
}

// ---------------------------------------------------------------------------
// Table widget
// ---------------------------------------------------------------------------

/**
 * Configuration for a table widget.
 * Renders a sortable data grid whose columns are defined in `columns`.
 */
export interface TableWidgetConfig extends BaseWidgetConfig {
  /** Discriminant — must be `"table"`. */
  widgetType: "table";

  /**
   * Ordered list of column definitions (1–100 entries).
   * Each entry specifies the data `field` and the `headerName` to display.
   */
  columns: ColumnDef[];

  /**
   * Maximum number of data rows to display per page.
   * When set to an integer between 1 and 1000, pagination controls are
   * rendered. When absent, all rows are shown without pagination.
   */
  pageSize?: number;

  /**
   * When `true`, users may drag column borders to resize columns.
   * Each column is constrained to a minimum width of 48 px and a maximum
   * width of 800 px.
   * Default: `false`.
   */
  resizableColumns?: boolean;
}

// ---------------------------------------------------------------------------
// KPI card widget
// ---------------------------------------------------------------------------

/**
 * Configuration for a KPI card widget.
 * Renders a key-performance-indicator card showing a primary metric value,
 * a label, and optional trend and target indicators.
 */
export interface KPIWidgetConfig extends BaseWidgetConfig {
  /** Discriminant — must be `"kpi"`. */
  widgetType: "kpi";

  /**
   * The data field whose value is displayed as the primary metric.
   * If the field is null, undefined, or absent, a no-data placeholder is
   * rendered instead.
   */
  valueField: string;

  /** Human-readable label rendered below the primary metric value. */
  label: string;

  /**
   * Optional data field used to derive the trend indicator.
   * Positive values render an up arrow; negative values render a down arrow.
   * The absolute value is displayed, rounded to one decimal place, followed
   * by a `%` symbol.
   */
  trendField?: string;

  /**
   * Optional string displayed immediately to the left of the metric value
   * (e.g. a currency symbol such as `"$"`).
   */
  prefix?: string;

  /**
   * Optional string displayed immediately to the right of the metric value
   * (e.g. a unit such as `"kg"` or `"%"`).
   */
  suffix?: string;

  /**
   * Optional numeric target for the metric value.
   * When set, the Salt Design System positive/warning/negative status colour
   * is applied depending on whether the metric is above, equal to, or below
   * the target.
   */
  target?: number;
}

// ---------------------------------------------------------------------------
// Text / Markdown widget
// ---------------------------------------------------------------------------

/**
 * Configuration for a text widget.
 * Renders Markdown content supplied either as a static string via `content`
 * or fetched dynamically via `dataSourceId`.
 * When both are set, `content` takes precedence and `dataSourceId` is ignored.
 */
export interface TextWidgetConfig extends BaseWidgetConfig {
  /** Discriminant — must be `"text"`. */
  widgetType: "text";

  /**
   * Static Markdown string to render.
   * Takes precedence over `dataSourceId` when both are provided.
   * When absent and `dataSourceId` is not set, the widget renders an empty
   * area with no error indicator.
   */
  content?: string;
}

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

/**
 * Union of all built-in widget config types, discriminated by `widgetType`.
 * Use this type for arrays of widgets on a page config (e.g. `PageConfig.widgets`).
 */
export type WidgetConfig =
  | ChartWidgetConfig
  | TableWidgetConfig
  | KPIWidgetConfig
  | TextWidgetConfig;
