/**
 * Uniform result shape returned by all data adapters.
 * Widgets and filters consume this interface without any conditional
 * branching on the underlying transport type.
 *
 * @template T - The shape of the data payload. Defaults to `unknown`.
 */
export interface DataResult<T = unknown> {
  /**
   * The fetched data payload, or `null` when no data is available
   * (e.g. while loading or when an error has occurred).
   */
  data: T | null;

  /**
   * `true` while a fetch is in flight; `false` once the request has
   * settled (either successfully or with an error).
   */
  loading: boolean;

  /**
   * A human-readable error message when the fetch failed, or `null`
   * when there is no error.
   */
  error: string | null;
}

/**
 * Contract that every data adapter implementation must satisfy.
 * Mock, API, and WebSocket adapters all implement this interface so
 * that widgets and filters remain transport-agnostic.
 */
export interface DataAdapter {
  /**
   * Fetch data for the given data source, optionally scoped by params.
   *
   * @param dataSourceId - The unique identifier of the data source as
   *   declared in the `dataSources` map of `DashboardConfig`.
   * @param params - Optional key/value pairs forwarded to the adapter
   *   (e.g. active filter values or route param values).
   * @returns A promise that resolves to a `DataResult` with a uniform
   *   `{ data, loading, error }` shape regardless of the transport.
   */
  fetch(
    dataSourceId: string,
    params?: Record<string, unknown>
  ): Promise<DataResult>;
}

/**
 * Schema for mock JSON data files consumed by `MockAdapter`.
 * Every file referenced by a `MockDataSourceConfig.filePath` must
 * conform to this shape.
 *
 * @template T - The shape of each item in the `data` array.
 *   Defaults to `Record<string, unknown>`.
 */
export interface MockDataFile<T = Record<string, unknown>> {
  /**
   * Required array of data objects consumed by widgets and filters.
   * Must contain at least zero items (an empty array is valid).
   */
  data: T[];

  /**
   * Optional metadata providing pagination information and column
   * hints for table-style widgets.
   */
  meta?: {
    /**
     * Optional pagination descriptor.
     * When present, widgets may use these values to render pagination
     * controls or request a specific page of data.
     */
    pagination?: {
      /** Total number of records across all pages. */
      total: number;

      /** The current page index (1-based). */
      page: number;

      /** Number of records per page. */
      pageSize: number;
    };

    /**
     * Optional column descriptors used by table-style widgets to
     * derive column headers and data types without additional config.
     */
    columns?: ColumnDescriptor[];
  };
}

/**
 * Describes a single column in a `MockDataFile`'s `meta.columns` array.
 * Table widgets may use this to derive headers and cell formatting.
 */
export interface ColumnDescriptor {
  /**
   * The key of the corresponding field in each data object.
   * Must match a property name in the `data` array items.
   */
  field: string;

  /**
   * Human-readable column heading displayed in the table header row.
   */
  headerName: string;

  /**
   * Optional semantic type of the column's values.
   * Used by widgets to apply appropriate formatting (e.g. date
   * formatting, numeric alignment, boolean toggles).
   * Defaults to `"string"` when absent.
   */
  type?: "string" | "number" | "boolean" | "date";
}
