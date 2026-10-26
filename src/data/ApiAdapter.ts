import type { DataAdapter, DataResult } from "../types/data";

export class ApiAdapter implements DataAdapter {
  private readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async fetch(_dataSourceId: string, params?: Record<string, unknown>): Promise<DataResult> {
    try {
      const url = new URL(this.endpoint, window.location.origin);
      for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        return {
          data: null,
          loading: false,
          error: `Request failed (${response.status}): ${url.pathname}`,
        };
      }

      const payload: unknown = await response.json();
      const data = typeof payload === "object" && payload !== null && "data" in payload
        ? payload.data
        : payload;

      return { data, loading: false, error: null };
    } catch (error) {
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "API request failed",
      };
    }
  }
}
