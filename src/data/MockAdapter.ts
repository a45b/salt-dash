import type { DataAdapter, DataResult, MockDataFile } from "../types/data";

/**
 * Eagerly load all JSON files under `src/data/mock/` at module initialisation
 * time via Vite's `import.meta.glob`. This is required because files in `src/`
 * are not served as static assets by the Vite dev server — they must be
 * imported through the module graph.
 *
 * The resulting map is keyed by the absolute-from-root path, e.g.
 * `/src/data/mock/chart-data.json`.
 */
const mockFiles = import.meta.glob("/src/data/mock/**/*.json", { eager: true });

/**
 * A `DataAdapter` implementation backed by static JSON files under
 * `src/data/mock/`. Intended for local development and testing only.
 *
 * @example
 * ```ts
 * const adapter = new MockAdapter("src/data/mock/chart-data.json");
 * const result = await adapter.fetch("chartSource");
 * // result.data → [{ month: "Jan", revenue: 42000 }, ...]
 * ```
 */
export class MockAdapter implements DataAdapter {
  private readonly filePath: string;
  /**
   * @param filePath - Path to the JSON file relative to the project root,
   *   e.g. `"src/data/mock/chart-data.json"`.  A leading `/` is optional
   *   and will be normalised automatically.
   */
  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Resolves the mock JSON file and returns its `data` array wrapped in a
   * uniform `DataResult`.
   *
   * The `dataSourceId` and `params` arguments are accepted to satisfy the
   * `DataAdapter` contract but are not used by this adapter — the file path
   * supplied at construction time is the sole data source.
   *
   * @returns
   * - `{ data, loading: false, error: null }` when the file is found and valid.
   * - `{ data: null, loading: false, error: "Mock data file not found: <filePath>" }` when the key is absent from the glob map.
   * - `{ data: null, loading: false, error: "Failed to parse mock data file: <filePath>" }` when the module exists but does not conform to `MockDataFile`.
   */
  async fetch(
    _dataSourceId: string,
    _params?: Record<string, unknown>
  ): Promise<DataResult> {
    // Normalise to an absolute-from-root key that matches the glob map keys.
    const key = this.filePath.startsWith("/")
      ? this.filePath
      : `/${this.filePath}`;

    try {
      const module = mockFiles[key] as
        | { default: MockDataFile }
        | MockDataFile
        | undefined;

      if (!module) {
        return {
          data: null,
          loading: false,
          error: `Mock data file not found: ${this.filePath}`,
        };
      }

      // Vite JSON imports expose the parsed value on the `default` export when
      // using `{ eager: true }` with the default import mode.
      const file = (module as { default: MockDataFile }).default ?? module;

      if (!file || !Array.isArray((file as MockDataFile).data)) {
        return {
          data: null,
          loading: false,
          error: `Failed to parse mock data file: ${this.filePath}`,
        };
      }

      return {
        data: (file as MockDataFile).data,
        loading: false,
        error: null,
      };
    } catch {
      return {
        data: null,
        loading: false,
        error: `Failed to parse mock data file: ${this.filePath}`,
      };
    }
  }
}
