import type { DataAdapter, DataResult } from "../types/data";

export class WebSocketAdapter implements DataAdapter {
  constructor(_url: string) {}

  async fetch(_dataSourceId: string, _params?: Record<string, unknown>): Promise<DataResult> {
    return { data: null, loading: false, error: "not implemented" };
  }
}
