# Implementation Plan: Salt Dash

## Overview

Build a config-driven single-page dashboard application using React, TypeScript, and Vite. The implementation follows the architecture defined in the design document: a central `DashboardConfig` TypeScript type drives all routing, widget instantiation, data loading, and filter state. The work is divided into sequential layers — project scaffolding, type system, config validation, data layer, widget library, page shell, and full wiring — so every task compiles and tests cleanly before the next begins.

## Tasks

- [x] 1. Scaffold project structure and install dependencies
  - Initialise a Vite project using the React + TypeScript template with Node ≥ 24 in the `engines` field of `package.json`
  - Create the required top-level `src/` directories: `components/`, `widgets/`, `config/`, `data/`, `hooks/`, `pages/`, `types/`
  - Install production dependencies: `react-router-dom`, `@salt-ds/core`, `@salt-ds/lab`, `@salt-ds/icons`, `recharts`, `marked`, `dompurify`
  - Install dev/test dependencies: `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `fast-check`, `jsdom`, `@types/dompurify`
  - Add `dev`, `build`, `preview`, and `test` scripts to `package.json`; configure Vitest with jsdom environment in `vite.config.ts`
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 2. Define the TypeScript config schema and types
  - [x] 2.1 Create `src/types/config.ts` with the `DashboardConfig`, `PageConfig`, `DataSourceConfig`, `MockDataSourceConfig`, `ApiDataSourceConfig`, `WebSocketDataSourceConfig`, `HeaderConfig`, `BreadcrumbItem`, and `FilterConfig` interfaces, with JSDoc on every field
    - `FilterConfig` must include `routeParams?: string[]` — an optional list of route param names (from the page's dynamic path segments) whose current URL values are forwarded to the filter's Data_Adapter as fetch params
    - _Requirements: 14.5, 14.6, 16.3_
  - [x] 2.2 Create `src/types/widgets.ts` with `BaseWidgetConfig`, `ChartWidgetConfig`, `TableWidgetConfig`, `KPIWidgetConfig`, `TextWidgetConfig`, `ColumnDef`, and a `WidgetConfig` discriminated union
    - `BaseWidgetConfig` must include `routeParams?: string[]` — a list of route param names from the page's dynamic segments that should be forwarded to this widget's Data_Adapter as fetch params
    - _Requirements: 3.1, 6.1, 7.1, 8.1, 9.1, 16.3_
  - [x] 2.3 Create `src/types/data.ts` with the `DataResult<T>`, `DataAdapter`, and `MockDataFile` interfaces
    - _Requirements: 4.4, 5.6_

- [x] 3. Implement config validation
  - [x] 3.1 Create `src/config/validateConfig.ts` implementing the synchronous `validateConfig(raw: unknown): ValidationResult` function that checks required page fields, unique `path` and `pageId`, unique `dataSourceId`, column count bounds, widget span bounds, and non-empty `widgetId`
    - Returns `{ valid: true, config: DashboardConfig }` or `{ valid: false, errors: ValidationError[] }`
    - _Requirements: 1.2, 1.5, 1.6, 2.2, 4.1, 14.3, 14.4_
  - [x]* 3.2 Write unit tests for `validateConfig` in `src/config/__tests__/validateConfig.test.ts`
    - Valid config passes; missing fields return specific errors; duplicates identified; bounds checked
    - _Requirements: 1.2, 1.5, 1.6_
  - [x]* 3.3 Write property test for config round-trip page registration
    - **Property 1: Config round-trip page registration**
    - **Validates: Requirements 1.1, 1.2, 1.7**
  - [x]* 3.4 Write property test for invalid page entries being skipped
    - **Property 2: Invalid page entries are skipped, not crashed**
    - **Validates: Requirements 1.5**
  - [x]* 3.5 Write property test for duplicate path/pageId first-wins invariant
    - **Property 3: Duplicate page path/pageId — first-wins invariant**
    - **Validates: Requirements 1.6**

- [x] 4. Create the stub config file and sample mock data
  - [x] 4.1 Create `src/config/dashboard.config.ts` exporting a minimal `DashboardConfig` object with one example page, two or three sample widgets, and references to mock data source entries
    - _Requirements: 14.1, 14.2_
  - [x] 4.2 Create example mock JSON files under `src/data/mock/`: one file per built-in widget type (`chart-data.json`, `table-data.json`, `kpi-data.json`, `text-data.json`), each conforming to the `MockDataFile` schema with a top-level `data` array of at least one entry and an optional `meta` object
    - _Requirements: 5.1, 5.6_

- [x] 5. Implement the Data Adapter layer
  - [x] 5.1 Create `src/data/MockAdapter.ts` implementing `DataAdapter` — reads the JSON file at `filePath` relative to project root using `fetch`/`import`, returns `{ data, loading: false, error: null }` on success, `{ data: null, loading: false, error: <message with filePath> }` on missing file, and `{ data: null, loading: false, error: <message mentioning parse failure> }` on malformed JSON
    - _Requirements: 4.5, 5.2, 5.4_
  - [x] 5.2 Create `src/data/ApiAdapter.ts` and `src/data/WebSocketAdapter.ts` as stub adapters that immediately return `{ data: null, loading: false, error: "not implemented" }` for their respective types
    - _Requirements: 4.7, 4.8_
  - [x] 5.3 Create `src/data/DataAdapter.ts` as the factory/dispatcher: resolves a `dataSourceId` against the config `dataSources` map, selects the correct adapter, caches mock responses for the lifetime of the current page render, and returns a uniform `DataResult<T>`; missing `dataSourceId` returns `{ data: null, loading: false, error: <non-empty string> }`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.9_
  - [ ]* 5.4 Write unit tests for `DataAdapter` in `src/data/__tests__/DataAdapter.test.ts`
    - Unknown ID resolves to error state; mock adapter returns data; missing file returns error with path; malformed file returns parse error
    - _Requirements: 4.3, 5.2, 5.4_
  - [ ]* 5.5 Write property test for DataAdapter returning uniform shape
    - **Property 6: DataAdapter returns uniform shape for all source types**
    - **Validates: Requirements 4.4**
  - [ ]* 5.6 Write property test for missing data source yielding error state
    - **Property 7: Missing data source yields error state, not a crash**
    - **Validates: Requirements 4.3**
  - [ ]* 5.7 Write property test for mock data file serialisation round-trip
    - **Property 8: Mock data file serialisation round-trip**
    - **Validates: Requirements 4.5, 5.1**

- [ ] 6. Implement the `useDataSource` hook and FilterContext
  - [ ] 6.1 Create `src/hooks/useDataSource.ts` wrapping `DataAdapter.fetch` in a React `useEffect`; manages `loading`, `data`, and `error` state; accepts `dataSourceId` and an optional `params` record; re-fetches when either argument changes
    - _Requirements: 4.4_
  - [ ] 6.2 Create `src/hooks/useFilters.ts` defining `FilterContext` and its `Provider`; initialises filter values from URL query parameters on mount (taking precedence over `defaultValue`); `setFilter` updates both in-memory state and URL via `useSearchParams`
    - `FilterContext.Provider` must only hydrate filter values for URL query param keys that match a `filterId` in the current page's `filters` config array; all other query params must remain in the URL unchanged and must not appear in `FilterContext.values`
    - `setFilter` must update only the specific `filterId` param without modifying unrelated query params
    - _Requirements: 12.8, 12.11_
  - [ ]* 6.3 Write unit tests for `useFilters` in `src/hooks/__tests__/useFilters.test.ts`
    - `setFilter` updates URL params; URL params hydrate values on mount; no URL params falls back to `defaultValue`; URL params whose keys do not match any `filterId` in the current page's `filters` array are NOT hydrated into `FilterContext.values`
    - _Requirements: 12.8, 12.11_
  - [ ]* 6.4 Write property test for filter state URL round-trip
    - **Property 9: Filter state URL round-trip**
    - **Validates: Requirements 12.11**

  - [ ] 6.5 Create `src/hooks/useRouteParams.ts` as a thin wrapper around React Router's `useParams()`, returning `Record<string, string | undefined>` for all named route params in the current URL
    - _Requirements: 16.2_

  - [ ]* 6.6 Write property test for route param values available to widgets
    - **Property 14: Route param values available to widgets**
    - **Validates: Requirements 16.2, 16.3**

  - [ ]* 6.7 Write property test for filter context ignoring unrelated query params
    - **Property 15: Filter context ignores unrelated query params**
    - **Validates: Requirements 12.11**

- [x] 7. Implement the widget registry
  - [x] 7.1 Create `src/widgets/registry.ts` with `registerWidget` and `resolveWidget` functions backed by a `Map<string, WidgetComponent>`
    - _Requirements: 3.4, 15.7_
  - [x]* 7.2 Write unit tests for the registry in `src/widgets/__tests__/registry.test.ts`
    - Register + resolve round-trip; unknown type returns `undefined`; re-registering same key overwrites
    - _Requirements: 3.4_

- [ ] 8. Implement the Chart Widget
  - [ ] 8.1 Create `src/widgets/ChartWidget.tsx` rendering Recharts components (`BarChart`, `LineChart`, `PieChart`, `AreaChart`, `ScatterChart`) based on `chartType`; applies Salt DS colour tokens to all chart series; maps `xField`/`yField` config to data keys; handles `pie` charts without requiring `xField`/`yField`
    - Render loading spinner (Salt DS) when `loading: true`; empty-data text label when `data` is empty; error message for invalid `chartType`, missing `xField`/`yField`, or data source error
    - _Requirements: 6.1–6.13, 13.2_
  - [ ]* 8.2 Write unit tests for `ChartWidget` in `src/widgets/__tests__/ChartWidget.test.ts`
    - Loading state; empty data; error from source; invalid `chartType`; missing `xField`/`yField`; pie chart ignores field errors
    - _Requirements: 6.8, 6.9, 6.11, 6.12, 6.13_

- [ ] 9. Implement the Table Widget
  - [ ] 9.1 Create `src/widgets/TableWidget.tsx` rendering a Salt DS data grid with configurable `columns`; implements three-state column sort (asc → desc → unsorted) with visual indicator; renders skeleton rows (count = `pageSize` or 5) while loading; pagination controls when `pageSize` is set; empty-state message; error state; optional column resizing (min 48px, max 800px) when `resizableColumns` is true
    - _Requirements: 7.1–7.8, 13.2_
  - [ ]* 9.2 Write unit tests for `TableWidget` in `src/widgets/__tests__/TableWidget.test.ts`
    - Skeleton rows equal to `pageSize`; empty-state; error state; sort cycle (unsorted → asc → desc → unsorted)
    - _Requirements: 7.2, 7.5, 7.6, 7.7_

- [ ] 10. Implement the KPI Card Widget
  - [ ] 10.1 Create `src/widgets/KPIWidget.tsx` displaying a primary metric value from `valueField`, a `label`, optional trend indicator (up/down arrow with absolute %, zero value shows no arrow), optional `prefix`/`suffix`, and optional target status colours (Salt DS positive/warning/negative tokens); loading skeleton; placeholder when `valueField` is null/undefined/absent
    - _Requirements: 8.1–8.7, 13.2_
  - [ ]* 10.2 Write unit tests for `KPIWidget` in `src/widgets/__tests__/KPIWidget.test.ts`
    - Up arrow for positive trend; down arrow for negative; placeholder when `valueField` absent; target status colours
    - _Requirements: 8.3, 8.5, 8.7_
  - [ ]* 10.3 Write property test for KPI trend indicator sign
    - **Property 11: KPI trend indicator sign agrees with value**
    - **Validates: Requirements 8.3**

- [ ] 11. Implement the Text / Markdown Widget
  - [ ] 11.1 Create `src/widgets/TextWidget.tsx` using `marked` to parse Markdown and `DOMPurify` to sanitise output (strip `<script>`, `<iframe>`, `<object>`, `<embed>`, `on*` attributes, preserving CommonMark-safe elements); applies Salt DS typography tokens to all rendered elements; handles static `content`, `content` + `dataSourceId` precedence, empty content, data-source-fetched content with 30-second timeout, and data source fetch failures
    - _Requirements: 9.1–9.8, 13.2, 13.4_
  - [ ]* 11.2 Write unit tests for `TextWidget` in `src/widgets/__tests__/TextWidget.test.ts`
    - Static content renders; `content` wins over `dataSourceId`; empty content shows empty area; `<script>` stripped; `on*` attributes stripped
    - _Requirements: 9.2, 9.3, 9.4, 9.7_
  - [ ]* 11.3 Write property test for HTML sanitisation
    - **Property 10: Text widget HTML sanitisation removes disallowed elements**
    - **Validates: Requirements 9.7**

- [ ] 12. Register all built-in widgets
  - Create `src/widgets/index.ts` that calls `registerWidget` for `chart`, `table`, `kpi`, and `text` types, importing each component file
  - _Requirements: 3.1, 3.4, 15.7_

- [ ] 13. Checkpoint — core widgets and data layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement the BreadcrumbBar component
  - [ ] 14.1 Create `src/components/BreadcrumbBar.tsx` using Salt DS Breadcrumb components; renders items in config order; last item always plain text regardless of `href`; items with `href` (non-last) render as links; items without `href` render as plain text; empty array renders nothing; items with missing/empty `label` are omitted without leaving a gap
    - _Requirements: 11.1–11.8, 13.2_
  - [ ]* 14.2 Write unit tests for `BreadcrumbBar` in `src/components/__tests__/BreadcrumbBar.test.ts`
    - Last item is plain text even with `href`; non-last with `href` is a link; no `href` is plain text; empty array renders nothing; empty `label` is omitted
    - _Requirements: 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_
  - [ ]* 14.3 Write property test for last breadcrumb never being a link
    - **Property 12: Breadcrumb last item is never a link**
    - **Validates: Requirements 11.6**

- [ ] 15. Implement the PageHeader component
  - [ ] 15.1 Create `src/components/PageHeader.tsx` using Salt DS heading/body-text components; renders title (when present) and subtitle; renders a Salt DS `Button` for each action in the `actions` array using the action's `label` and `variant` (defaulting to Salt DS default variant); on click, calls `dispatchAction(actionId)`; absent `header` config renders nothing
    - _Requirements: 10.1–10.7, 13.2_
  - [ ] 15.2 Create `src/data/actionRegistry.ts` with `registerAction` and `dispatchAction`; `dispatchAction` logs a console warning for unregistered `actionId` and does nothing further
    - _Requirements: 10.6, 10.7_
  - [ ]* 15.3 Write unit tests for `actionRegistry` in `src/data/__tests__/actionRegistry.test.ts`
    - Registered handler is called; unregistered `actionId` emits warning and does not throw
    - _Requirements: 10.6, 10.7_

- [ ] 16. Implement the FilterBar component
  - [ ] 16.1 Create `src/components/FilterBar.tsx` rendering a row of filter controls; dispatches `setFilter` from `FilterContext` on value change; text-search filters debounce 300 ms before triggering re-evaluation
    - _Requirements: 12.1, 12.9_
  - [ ] 16.2 Implement `SelectFilter`, `MultiSelectFilter`, `DateRangeFilter`, `TextSearchFilter`, and `ToggleFilter` sub-components (can live in the same file or separate files in `src/components/filters/`), each using the corresponding Salt DS component; `select` disables and labels "no options" when `options` is absent/empty; filters with `dataSourceId` populate from data source within 5 seconds, else render disabled with error message
    - _Requirements: 12.2–12.10, 13.2_
  - [ ]* 16.3 Write unit tests for filter initialisation and interaction
    - Default value applied on load; URL param takes precedence over default; text-search debounce; select disabled when options empty
    - _Requirements: 12.3, 12.8, 12.9, 12.11_

- [ ] 17. Implement the WidgetGrid and WidgetRenderer components
  - [ ] 17.1 Create `src/components/WidgetGrid.tsx` rendering a CSS grid with column count from page config (default 12); places each `WidgetCell` in config order; responsive: below 768px viewport width, each widget spans the full column count
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 13.3_
  - [ ] 17.2 Create `src/components/WidgetCell.tsx` applying `colSpan` (capped to page column count) and `rowSpan` (defaulting to 6 and 1 respectively) as CSS grid properties
    - _Requirements: 2.2, 2.3, 2.6_
  - [ ] 17.3 Create `src/components/WidgetRenderer.tsx` resolving `widgetType` from the registry; renders the matched component with its config; renders an `UnknownWidgetPlaceholder` (fixed error label + unrecognised type string) when `widgetType` is not in the registry; deduplicates widgets by `widgetId` (first-wins, console warning for duplicates)
    - _Requirements: 3.2, 3.3, 3.5_
  - [ ]* 17.4 Write unit tests for `WidgetGrid` and `WidgetRenderer`
    - Unknown widget type shows placeholder; duplicate `widgetId` renders first and warns; `colSpan` cap applied
    - _Requirements: 2.6, 3.3, 3.5_
  - [ ]* 17.5 Write property test for widget colSpan capping
    - **Property 4: Widget colSpan is always capped to page column count**
    - **Validates: Requirements 2.6**
  - [ ]* 17.6 Write property test for widget grid order matching config order
    - **Property 5: Widget grid order matches config order**
    - **Validates: Requirements 2.4**
  - [ ]* 17.7 Write property test for duplicate widgetId first-wins invariant
    - **Property 13: Duplicate widgetId on a page — first-wins invariant**
    - **Validates: Requirements 3.5**

- [ ] 18. Implement the PageRenderer and application shell
  - [ ] 18.1 Create `src/pages/PageRenderer.tsx` composing `BreadcrumbBar`, `PageHeader`, `FilterBar` (wrapped in `FilterContext.Provider`), and `WidgetGrid` for the matched page config; passes `useFilters` values to each widget's `useDataSource` call as `params`
    - Call `useRouteParams()` once per render; for each widget, merge the values of params listed in the widget's `routeParams` array into the `params` object passed to `useDataSource`; param names in `routeParams` that are absent from the current URL are passed as `undefined`; the same scoping applies to filters via `FilterContext.Provider`
    - _Requirements: 10.1, 11.1, 11.2, 12.1, 16.2, 16.3, 16.4_
  - [ ] 18.2 Create `src/pages/NotFoundPage.tsx` built entirely with Salt DS components, showing a "page not found" message and a link to the first configured page (or `/` if none)
    - _Requirements: 1.4_
  - [ ] 18.3 Create `src/pages/FatalErrorScreen.tsx` and `src/pages/EmptyConfigScreen.tsx` using Salt DS components; `FatalErrorScreen` lists each `ValidationError` path and message; `EmptyConfigScreen` shows a message indicating no pages are configured
    - _Requirements: 1.3, 14.3, 14.4_
  - [ ] 18.4 Create `src/config/ConfigValidator.tsx` that imports `dashboard.config.ts`, calls `validateConfig`, renders `FatalErrorScreen` on fatal errors, and passes the validated config to `AppRouter` on success
    - _Requirements: 1.5, 1.6, 14.1, 14.2, 14.3_
  - [ ] 18.5 Create `src/AppRouter.tsx` building one `<Route>` per valid page entry (using the page's `path`) plus a catch-all `*` route for `NotFoundPage`; if the validated config has zero page entries renders `EmptyConfigScreen`
    - _Requirements: 1.1, 1.3, 1.4, 1.7_
  - [ ] 18.6 Create `src/App.tsx` wrapping `ConfigValidator` in a `SaltProvider` configured with `theme` and `mode` from config (defaulting to `"light"` and Salt DS default theme); wrap `App` in `BrowserRouter` from react-router-dom in `src/main.tsx`
    - _Requirements: 13.1, 13.5_
  - [ ] 18.7 Update `validateConfig` / `AppRouter` to detect page entries whose `path` patterns would match the same URL (e.g. `/orders/:orderId` and `/orders/:id`); log a console warning identifying the conflicting paths and render only the first matching entry
    - _Requirements: 16.6_

- [ ] 19. Apply Salt Design System styling constraints globally
  - Audit all components to ensure: Salt DS layout primitives (`FlexLayout`, `GridLayout`, `StackLayout`) used for all structural layouts outside widget content areas; Salt DS typography tokens applied to all text outside widget content areas; no inline styles or local CSS overrides Salt DS colour or typography tokens
  - _Requirements: 13.3, 13.4, 13.6_

- [ ] 20. Checkpoint — full application wiring
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Write integration tests
  - [ ]* 21.1 Write an integration test for full page render
    - Mount the app with a complete `DashboardConfig` and static mock files; verify routes resolve to correct page titles; verify at least one widget renders its mock data
    - _Requirements: 1.1, 3.2, 4.5_
  - [ ]* 21.2 Write an integration test for filter interaction
    - Change a filter value; verify URL query params update and the widget re-requests data with the new params
    - _Requirements: 12.9, 12.11_
  - [ ]* 21.3 Write an integration test for `FatalErrorScreen`
    - Provide an invalid config; verify `FatalErrorScreen` is rendered with the expected error messages
    - _Requirements: 14.3, 14.4_

- [ ] 22. Final checkpoint — Ensure all tests pass
  - Run the full Vitest suite; verify `build` script produces a `dist/` bundle with `index.html` and hashed assets; ask the user if questions arise.
  - _Requirements: 15.3, 15.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at meaningful milestones
- Property-based tests use `fast-check` and must run a minimum of 100 iterations each; each test carries a tag comment `// Feature: salt-dash, Property N: <title>`
- Unit tests are complementary to property tests — both are needed for full coverage
- All interactive controls must use Salt DS equivalents; no third-party or custom-built controls where a Salt DS component exists
- The widget registry pattern (`src/widgets/registry.ts` + `src/widgets/index.ts`) means adding a new widget type never requires modifying existing files

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "7.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.1", "4.2", "7.2"] },
    { "id": 4, "tasks": ["5.1", "5.2"] },
    { "id": 5, "tasks": ["5.3"] },
    { "id": 6, "tasks": ["5.4", "5.5", "5.6", "5.7", "6.1", "6.2"] },
    { "id": 7, "tasks": ["6.3", "6.4", "6.5", "6.6", "6.7", "8.1", "10.1", "11.1"] },
    { "id": 8, "tasks": ["8.2", "9.1", "10.2", "10.3", "11.2", "11.3"] },
    { "id": 9, "tasks": ["9.2", "12"] },
    { "id": 10, "tasks": ["14.1", "15.1", "15.2"] },
    { "id": 11, "tasks": ["14.2", "14.3", "15.3", "16.1", "16.2"] },
    { "id": 12, "tasks": ["16.3", "17.1", "17.2", "17.3"] },
    { "id": 13, "tasks": ["17.4", "17.5", "17.6", "17.7"] },
    { "id": 14, "tasks": ["18.1", "18.2", "18.3", "18.4"] },
    { "id": 15, "tasks": ["18.5", "18.6", "18.7"] },
    { "id": 16, "tasks": ["19"] },
    { "id": 17, "tasks": ["21.1", "21.2", "21.3"] }
  ]
}
```
