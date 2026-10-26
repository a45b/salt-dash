import type { DashboardConfig, DataSourceConfig } from "../types/config";
import type { DataAdapter, DataResult } from "../types/data";
import { MockAdapter } from "./MockAdapter";
import { ApiAdapter } from "./ApiAdapter";
import { WebSocketAdapter } from "./WebSocketAdapter";

// Module-level cache: one adapter instance per dataSourceId
const adapterCache = new Map<string, DataAdapter>();

/**
 * Clears the module-level adapter cache.
 * Primarily useful in tests to reset state between test cases.
 */
export function clearAdapterCache(): void {
  adapterCache.clear();
}

/**
 * Instantiates the correct concrete adapter for the given data source config.
 * Uses the `type` discriminant to select between `MockAdapter`, `ApiAdapter`,
 * and `WebSocketAdapter`.
 */
function createAdapter(config: DataSourceConfig): DataAdapter {
  switch (config.type) {
    case "mock":
      return new MockAdapter(config.filePath);
    case "api":
      return new ApiAdapter(config.endpoint);
    case "websocket":
      return new WebSocketAdapter(config.url);
  }
}

/**
 * Resolves a `dataSourceId` against the config `dataSources` map, selects
 * the correct concrete adapter (creating and caching it on first use), and
 * delegates the fetch call to that adapter.
 *
 * @param dataSources - The `dataSources` map from `DashboardConfig`.
 * @param dataSourceId - The key identifying which data source to fetch.
 * @param params - Optional key/value pairs forwarded to the adapter
 *   (e.g. active filter values or route param values).
 * @returns A promise that resolves to a uniform `DataResult<T>`.
 *   When `dataSourceId` is not present in `dataSources`, resolves to
 *   `{ data: null, loading: false, error: "Unknown data source: <dataSourceId>" }`.
 */
export async function fetchData<T = unknown>(
  dataSources: DashboardConfig["dataSources"],
  dataSourceId: string,
  params?: Record<string, unknown>
): Promise<DataResult<T>> {
  const config = dataSources[dataSourceId];
  if (!config) {
    return {
      data: null,
      loading: false,
      error: `Unknown data source: ${dataSourceId}`,
    };
  }

  let adapter = adapterCache.get(dataSourceId);
  if (!adapter) {
    adapter = createAdapter(config);
    adapterCache.set(dataSourceId, adapter);
  }

  return adapter.fetch(dataSourceId, params) as Promise<DataResult<T>>;
}
