# Requirements Document

## Introduction

Salt Dash is a config-driven UI dashboard application built with Node 24, Vite, and the Salt Design System. The application renders pages, widgets, filters, headers, and breadcrumbs entirely from a declarative configuration — no code changes are needed to add or modify a dashboard page. Each page is a self-contained dashboard composed of configurable widgets drawn from an extensible widget library. Widgets and filters connect to data sources that are initially backed by local JSON mock files, with the architecture designed to support real HTTP APIs and WebSockets in the future.

## Glossary

- **App**: The Salt Dash single-page application, served and bundled by Vite.
- **Config**: The top-level declarative JSON/TypeScript configuration object that defines all pages, data sources, and global settings.
- **Page**: A named route in the App, described entirely in Config, that renders a set of Widgets with optional Header, Breadcrumb, and Filters.
- **Widget**: A reusable UI component instantiated from the Widget Library according to Config. Each Widget displays data from one Data Source.
- **Widget Library**: The catalogue of available Widget types (Chart, Table, KPI Card, Text). New types can be added without changing the Config schema.
- **Chart_Widget**: A Widget that renders a chart (bar, line, pie, area, scatter) driven by Config and a Data Source.
- **Table_Widget**: A Widget that renders a sortable, filterable data grid driven by Config and a Data Source.
- **KPI_Widget**: A Widget that renders a key-performance-indicator card showing a primary metric value, label, and optional trend indicator.
- **Text_Widget**: A Widget that renders static or data-bound Markdown content.
- **Filter**: A configurable UI control (select, multi-select, date range, text search, toggle) scoped to a Page that narrows the data shown by Widgets on that Page.
- **Data_Source**: A named configuration entry that describes how data is fetched. Type is one of `mock`, `api`, or `websocket`.
- **Mock_Data_Source**: A Data Source of type `mock` that reads data from a local JSON file at a configured path.
- **API_Data_Source**: A Data Source of type `api` that fetches data from an HTTP endpoint (future).
- **WebSocket_Data_Source**: A Data Source of type `websocket` that streams data over a WebSocket connection (future).
- **Data_Adapter**: The runtime module that resolves a Data Source reference to actual data, abstracting the transport from Widgets and Filters.
- **Header**: An optional top-of-page UI region defined in Config, showing a title, subtitle, and optional action buttons.
- **Breadcrumb**: An optional navigation trail rendered at the top of a Page, with items defined in Config.
- **Layout**: The grid arrangement of Widgets on a Page, defined in Config using column-span and row-span values.
- **Salt_Design_System**: The component library (`@salt-ds/core`, `@salt-ds/lab`, `@salt-ds/icons`) used for all UI primitives.

---

## Requirements

### Requirement 1: Config-Driven Page Registration

**User Story:** As a dashboard author, I want to define pages entirely in config, so that I can add, rename, or remove dashboard pages without writing application code.

#### Acceptance Criteria

1. THE App SHALL render exactly one route per Page entry defined in Config, where each route's path matches the `path` field of its Page entry.
2. THE Config SHALL require a `path`, `title`, and `pageId` for each Page entry, where `path` must begin with `/` and be unique across all Page entries, and `pageId` must be unique across all Page entries.
3. WHEN the Config contains zero Page entries, THE App SHALL display a screen containing a message indicating that no pages are configured.
4. WHEN a user navigates to a URL path that has no matching `path` value in any Config Page entry, THE App SHALL display a not-found screen built with Salt Design System components, containing a message indicating the page does not exist.
5. WHEN the App starts and the Config contains a Page entry missing one or more required fields (`path`, `title`, or `pageId`), THE App SHALL log an error message identifying the missing field(s) and the affected entry index, and SHALL skip rendering a route for that Page entry.
6. IF the Config contains two or more Page entries with the same `path` or the same `pageId`, THEN THE App SHALL log an error identifying the duplicate value and SHALL render only the first occurrence of that Page entry.
7. WHEN the App is restarted after the Config has been updated, THE App SHALL render routes that match the current set of valid Page entries in the updated Config, with no routes present for Page entries removed from Config and new routes present for Page entries added to Config.

---

### Requirement 2: Page Layout and Widget Placement

**User Story:** As a dashboard author, I want to arrange widgets on a page using a grid layout defined in config, so that I can control the visual structure of each dashboard without writing CSS.

#### Acceptance Criteria

1. THE App SHALL render each Page using a CSS grid whose column count is defined in Config as an integer between 1 and 24 (default: 12 columns).
2. WHEN a Widget entry specifies `colSpan` and `rowSpan` in Config, THE App SHALL render that Widget occupying the specified grid area, where `colSpan` is an integer between 1 and the page's configured column count and `rowSpan` is an integer between 1 and 100.
3. WHEN `colSpan` or `rowSpan` is absent from a Widget entry, THE App SHALL apply a default span of 6 columns and 1 row.
4. THE App SHALL render Widgets in the order they appear in the Config Page entry.
5. WHEN the viewport width falls below 768px, THE App SHALL render each Widget spanning the full column count of the page grid.
6. IF a Widget's `colSpan` value exceeds the page's configured column count, THEN THE App SHALL cap that Widget's rendered column span to the page's configured column count.

---

### Requirement 3: Widget Library and Instantiation

**User Story:** As a dashboard author, I want to select a widget type from a library in config, so that I can compose dashboards from reusable components without duplicating code.

#### Acceptance Criteria

1. THE Widget_Library SHALL include, at minimum, the following Widget types: `chart`, `table`, `kpi`, `text`.
2. WHEN a Page Config entry references a `widgetType` that exists in the Widget_Library, THE App SHALL instantiate and render that Widget with the provided Config properties.
3. WHEN a Page Config entry references a `widgetType` that does not exist in the Widget_Library, THE App SHALL render an error placeholder in that Widget's grid cell displaying a fixed error label and the unrecognized `widgetType` value, and SHALL NOT render any other widget content in that cell.
4. THE Widget_Library SHALL be extensible — new Widget types SHALL be registerable by adding a new entry to the widget registry; THE App SHALL recognize and instantiate a newly registered Widget type without any changes to existing Widget or Page source files.
5. WHEN duplicate `widgetId` values are detected on the same Page, THE App SHALL emit a warning to the browser console and SHALL render only the first occurrence of each duplicate `widgetId`, skipping subsequent occurrences on that Page.

---

### Requirement 4: Data Source Abstraction

**User Story:** As a developer, I want widgets and filters to reference named data sources defined in config, so that I can swap between mock, API, and WebSocket data without changing widget or filter code.

#### Acceptance Criteria

1. THE Config SHALL support a top-level `dataSources` map where each entry defines a `type` (`mock` | `api` | `websocket`), a unique `dataSourceId`, and type-specific parameters; duplicate `dataSourceId` values SHALL cause the App to log an error and use only the first entry with that ID.
2. WHEN a Widget or Filter references a `dataSourceId`, THE Data_Adapter SHALL resolve that ID to the corresponding Data_Source entry in Config.
3. IF a Widget or Filter references a `dataSourceId` that does not exist in Config, THEN THE Data_Adapter SHALL return an error state and THE Widget or Filter SHALL display a non-interactive placeholder with a visible text label indicating the data source could not be found.
4. THE Data_Adapter SHALL return data to Widgets and Filters using the same object structure (containing `data`, `error`, and `loading` fields) regardless of the underlying Data_Source type, so that Widgets and Filters can consume data without any conditional branching on transport type.
5. WHEN a Data_Source of type `mock` is resolved, THE Data_Adapter SHALL read the JSON file at the configured `filePath` relative to the project root.
6. IF a Mock_Data_Source file path cannot be read (file missing or unreadable), THEN THE Data_Adapter SHALL return an error state containing the unresolvable file path and THE Widget or Filter SHALL display the same non-interactive placeholder defined in criterion 3.
7. WHEN a Data_Source of type `api` is resolved, THE Data_Adapter SHALL perform an HTTP GET to the configured `endpoint` URL (future implementation: currently returns a not-implemented error).
8. WHEN a Data_Source of type `websocket` is resolved, THE Data_Adapter SHALL open a WebSocket connection to the configured `url` (future implementation: currently returns a not-implemented error).
9. WHILE a page render is in progress, THE Data_Adapter SHALL cache Mock_Data_Source responses so that multiple Widgets or Filters referencing the same `dataSourceId` do not trigger redundant file reads; the cache SHALL be invalidated when the page render completes.

---

### Requirement 5: Mock Data Sources

**User Story:** As a developer, I want widgets to load data from local JSON mock files, so that I can develop and demonstrate dashboards without a live backend.

#### Acceptance Criteria

1. THE App SHALL ship with at least one example Mock_Data_Source JSON file per built-in Widget type, where each file contains a top-level `data` array with at least one entry whose fields match the schema defined in criterion 6.
2. WHEN a Mock_Data_Source `filePath` points to a file that does not exist, THE Data_Adapter SHALL return an error object containing the unresolvable file path and an error message indicating the file was not found.
3. IF the Data_Adapter returns a file-not-found error, THEN THE Widget SHALL display an error state that includes the unresolvable file path visible to the user.
4. WHEN a Mock_Data_Source JSON file is malformed (not valid JSON), THE Data_Adapter SHALL return an error object containing the file path and an error message indicating a parse failure.
5. IF the Data_Adapter returns a parse error, THEN THE Widget SHALL display an error state that includes an indication that the file content could not be parsed.
6. THE Mock_Data_Source JSON schema SHALL require a top-level `data` array of objects and accept an optional top-level `meta` object containing at most one `pagination` object (with numeric `total`, `page`, and `pageSize` fields) and at most one `columns` array of column-descriptor objects.

---

### Requirement 6: Chart Widget

**User Story:** As a dashboard author, I want to render charts of various types in a widget, so that I can visualise trends and distributions on a dashboard page.

#### Acceptance Criteria

1. THE Chart_Widget SHALL support the following chart types via Config: `bar`, `line`, `pie`, `area`, `scatter`.
2. WHEN a Chart_Widget Config specifies `chartType: "bar"`, THE Chart_Widget SHALL render a bar chart using data from the referenced Data_Source.
3. WHEN a Chart_Widget Config specifies `chartType: "line"`, THE Chart_Widget SHALL render a line chart using data from the referenced Data_Source.
4. WHEN a Chart_Widget Config specifies `chartType: "pie"`, THE Chart_Widget SHALL render a pie chart using data from the referenced Data_Source.
5. WHEN a Chart_Widget Config specifies `chartType: "area"`, THE Chart_Widget SHALL render an area chart using data from the referenced Data_Source.
6. WHEN a Chart_Widget Config specifies `chartType: "scatter"`, THE Chart_Widget SHALL render a scatter chart using data from the referenced Data_Source.
7. THE Chart_Widget SHALL accept `xField` and `yField` Config properties that map Data_Source fields to chart axes; IF a specified `xField` or `yField` value does not match any field name present in the Data_Source response, THEN THE Chart_Widget SHALL display an error message indicating the missing field and render no chart.
8. WHEN the Data_Source returns an empty data array, THE Chart_Widget SHALL display a visible, non-blank text label indicating no data is available rather than a blank chart area.
9. WHILE data is being loaded from the Data_Source, THE Chart_Widget SHALL display a loading indicator using Salt Design System components; WHEN the Data_Source response is received, THE Chart_Widget SHALL remove the loading indicator and render the chart.
10. THE Chart_Widget SHALL apply Salt Design System colour tokens to all chart series such that no chart series uses a colour value outside the active Salt Design System theme's colour token set.
11. IF the Chart_Widget Config specifies a `chartType` value that is not one of `bar`, `line`, `pie`, `area`, or `scatter`, THEN THE Chart_Widget SHALL display an error message indicating the unsupported chart type and render no chart.
12. IF the Data_Source returns an error response, THEN THE Chart_Widget SHALL display an error message indicating that data could not be loaded and render no chart.
13. THE Chart_Widget SHALL not require `xField` or `yField` Config properties when `chartType` is `pie`; IF `xField` or `yField` are provided for a `pie` chart, THE Chart_Widget SHALL ignore them without displaying an error.

---

### Requirement 7: Table Widget

**User Story:** As a dashboard author, I want to display tabular data in a widget, so that users can browse, sort, and search records on a dashboard page.

#### Acceptance Criteria

1. THE Table_Widget SHALL render columns defined in Config as a `columns` array of 1 to 100 entries, each with a `field` and `headerName`.
2. WHEN a user clicks a sortable column header, THE Table_Widget SHALL sort rows by that column in ascending order and display a visual sort-direction indicator; a second click SHALL sort in descending order; a third click SHALL return the column to its unsorted state and remove the sort indicator.
3. IF the `pageSize` Config property is set to an integer between 1 and 1000, THEN THE Table_Widget SHALL display at most `pageSize` rows per page AND SHALL render page-navigation controls using Salt Design System components.
4. IF `pageSize` is not specified in Config, THEN THE Table_Widget SHALL render all rows without pagination controls.
5. WHILE data is being loaded from the Data_Source, THE Table_Widget SHALL display a skeleton loading state using Salt Design System components with a number of skeleton rows equal to the configured `pageSize`, or 5 skeleton rows if `pageSize` is not configured.
6. WHEN the Data_Source returns an empty data array, THE Table_Widget SHALL display an empty-state message spanning all columns indicating that no records are available.
7. IF the Data_Source returns an error response, THEN THE Table_Widget SHALL display an error message indicating that data could not be loaded and SHALL NOT render data rows or skeleton rows.
8. IF the `resizableColumns` Config property is `true`, THEN THE Table_Widget SHALL allow users to drag column borders to resize columns, with each column constrained to a minimum width of 48px and a maximum width of 800px.

---

### Requirement 8: KPI Card Widget

**User Story:** As a dashboard author, I want to display key metrics in a card widget, so that users can quickly see the most important numbers on a dashboard page.

#### Acceptance Criteria

1. THE KPI_Widget SHALL render a primary metric value from the `valueField` Config property mapped to the Data_Source.
2. THE KPI_Widget SHALL render a label from the `label` Config property.
3. WHERE the `trendField` Config property is set, THE KPI_Widget SHALL render a trend indicator derived from the Data_Source `trendField` value, displaying an up arrow when the value is positive, a down arrow when the value is negative, and the absolute value rounded to one decimal place followed by a `%` symbol.
4. WHERE the `prefix` or `suffix` Config properties are set, THE KPI_Widget SHALL display the `prefix` value immediately to the left of the metric value and the `suffix` value immediately to the right of the metric value.
5. WHERE the `target` Config property is set, THE KPI_Widget SHALL apply the Salt Design System positive status colour when the metric value is greater than the target, the warning status colour when the metric value equals the target, and the negative status colour when the metric value is less than the target.
6. WHILE data is loading, THE KPI_Widget SHALL display a loading skeleton using Salt Design System components.
7. IF the Data_Source value at `valueField` is null, undefined, or absent, THEN THE KPI_Widget SHALL display a placeholder indicating no data is available and SHALL NOT render a trend indicator or target status indicator.

---

### Requirement 9: Text / Markdown Widget

**User Story:** As a dashboard author, I want to render formatted text or documentation in a widget, so that I can add context, instructions, or annotations to a dashboard page.

#### Acceptance Criteria

1. THE Text_Widget SHALL render Markdown content into HTML using a Markdown parser.
2. WHEN the `content` Config property is a non-empty static string and `dataSourceId` is not set, THE Text_Widget SHALL render that string as Markdown without fetching a Data_Source.
3. WHEN both `content` and `dataSourceId` Config properties are set simultaneously, THE Text_Widget SHALL render the `content` static string and ignore the `dataSourceId` property.
4. WHEN the `content` Config property is an empty string or is not set and `dataSourceId` is not set, THE Text_Widget SHALL render an empty visible area with no content and no error indicator.
5. WHEN the `dataSourceId` Config property is set and `content` is not set, THE Text_Widget SHALL display a loading indicator while the Data_Source fetch is in progress, then render the returned string as Markdown upon completion.
6. IF the Data_Source fetch initiated by `dataSourceId` fails or does not complete within 30 seconds, THEN THE Text_Widget SHALL replace the loading indicator with an error message indicating that content could not be loaded, and SHALL NOT render partial content.
7. THE Text_Widget SHALL sanitise rendered HTML before inserting it into the DOM by stripping all HTML elements and attributes not present in the CommonMark-safe allowlist, including removing `<script>`, `<iframe>`, `<object>`, `<embed>`, and `on*` event attributes, while preserving standard text-formatting elements such as `<strong>`, `<em>`, `<a>`, `<code>`, `<pre>`, `<blockquote>`, `<ul>`, `<ol>`, `<li>`, `<h1>`–`<h6>`, and `<p>`.
8. THE Text_Widget SHALL apply Salt Design System typography tokens to all rendered Markdown elements, including headings (`<h1>`–`<h6>`), paragraphs, unordered lists, ordered lists, blockquotes, inline code, code blocks, and hyperlinks.

---

### Requirement 10: Page Header

**User Story:** As a dashboard author, I want to define an optional header for each page in config, so that users have clear context about what they are viewing.

#### Acceptance Criteria

1. WHERE a Page Config entry includes a `header` object, THE App SHALL render a Header region above the widget grid on that Page.
2. WHERE a Page Config entry includes a `header` object with a `title` string, THE App SHALL display the `title` using a Salt Design System heading component in the Header region.
3. WHERE a Page Config `header` object does not include a `title` string, THE App SHALL render the Header region without a heading element.
4. WHERE a `subtitle` property is present in the `header` Config object, THE Header SHALL render it below the title using a Salt Design System body text component.
5. WHERE an `actions` array is present in the `header` Config object, THE Header SHALL render a Salt Design System Button for each action entry in the order they appear in the array, using the action's `label` as the button label and the action's `variant` as the button variant; WHERE an action entry does not include a `variant` property, THE Header SHALL render that Button using the default Salt Design System Button variant.
6. WHEN an action Button is clicked, THE App SHALL execute the handler registered under the action's `actionId` in the application action registry.
7. IF an action Button is clicked and no handler is registered under the action's `actionId` in the application action registry, THEN THE App SHALL log a warning indicating the unregistered `actionId` and take no further action.

---

### Requirement 11: Breadcrumb Navigation

**User Story:** As a dashboard author, I want to define breadcrumb navigation for each page in config, so that users can understand their location and navigate to parent pages.

#### Acceptance Criteria

1. WHERE a Page Config entry includes a `breadcrumbs` array with one or more items, WHILE the Header is present, THE App SHALL render a Breadcrumb component immediately above the Header using Salt Design System components.
2. WHERE a Page Config entry includes a `breadcrumbs` array with one or more items, WHILE the Header is absent, THE App SHALL render a Breadcrumb component at the top of the page content area using Salt Design System components.
3. EACH breadcrumb item SHALL have a `label` of 1 to 100 characters and an optional `href` property defined in Config.
4. WHEN a breadcrumb item has an `href`, THE App SHALL render it as a navigable link, unless it is the last item in the array.
5. WHEN a breadcrumb item has no `href`, THE App SHALL render it as plain text.
6. THE App SHALL always render the last breadcrumb item as non-navigable plain text regardless of whether an `href` is provided in Config.
7. IF a Page Config `breadcrumbs` array is empty, THEN THE App SHALL render no Breadcrumb component for that page.
8. IF a breadcrumb item has a missing or empty `label`, THEN THE App SHALL not render that item and SHALL not leave a gap in the breadcrumb trail.

---

### Requirement 12: Page Filters

**User Story:** As a dashboard author, I want to define configurable filters for a page, so that users can interactively narrow the data displayed by widgets on that page.

#### Acceptance Criteria

1. WHERE a Page Config entry includes a `filters` array, THE App SHALL render a filter bar between the Header and the widget grid on that Page.
2. THE App SHALL support the following Filter types via Config: `select`, `multi-select`, `date-range`, `text-search`, `toggle`.
3. WHEN a Filter Config entry specifies `type: "select"`, THE App SHALL render a single-select dropdown using Salt Design System components, populated with the `options` array from Config; IF the `options` array is absent or empty, THEN THE App SHALL render the dropdown in a disabled state with a label indicating no options are available.
4. WHEN a Filter Config entry specifies `type: "multi-select"`, THE App SHALL render a multi-select control using Salt Design System components.
5. WHEN a Filter Config entry specifies `type: "date-range"`, THE App SHALL render a date-range picker using Salt Design System components.
6. WHEN a Filter Config entry specifies `type: "text-search"`, THE App SHALL render a text input using Salt Design System components.
7. WHEN a Filter Config entry specifies `type: "toggle"`, THE App SHALL render a toggle/switch using Salt Design System components.
8. WHEN a Filter's `defaultValue` property is set in Config, THE App SHALL initialise that Filter with the specified value on Page load.
9. WHEN a Filter value changes, THE App SHALL re-evaluate all Widgets on the Page that reference the same `dataSourceId` as the Filter by passing the updated filter value as a parameter to that Data_Source; for `text-search` Filters, THE App SHALL wait 300 milliseconds after the last keystroke before triggering re-evaluation.
10. WHEN a Filter references a `dataSourceId` for its options, THE App SHALL populate the Filter's option list from the Data_Source response within 5 seconds of Page load; IF the Data_Source request fails or does not respond within 5 seconds, THEN THE App SHALL render the Filter in a disabled state with an error message indicating options could not be loaded.
11. THE App SHALL encode the current filter state as URL query parameters so that filtered views can be bookmarked and shared; IF URL query parameters for a Filter are present on Page load, THEN THE App SHALL initialise that Filter with the URL parameter value, taking precedence over any `defaultValue` set in Config; THE App SHALL only read URL query parameters whose keys match a `filterId` defined in the current page's `filters` config array, and all other query parameters SHALL be passed through unchanged and SHALL NOT affect filter state on that page.

---

### Requirement 13: Salt Design System Integration

**User Story:** As a developer, I want all UI primitives to use the Salt Design System, so that the application has a consistent, accessible visual language.

#### Acceptance Criteria

1. THE App SHALL wrap all content in a `SaltProvider` configured with the `theme` and `mode` values defined in the App Config, defaulting to `"light"` mode and the Salt Design System default theme if either value is absent from the App Config.
2. THE App SHALL use Salt Design System components for all interactive controls, including buttons, inputs, selects, toggles, date pickers, and pagination; no custom-built or third-party interactive control SHALL be used where an equivalent Salt component exists.
3. THE App SHALL use Salt Design System layout primitives (`FlexLayout`, `GridLayout`, `StackLayout`) for all structural layouts outside of Widget content areas.
4. THE App SHALL use Salt Design System typography tokens for all text elements rendered outside of Widget content areas, where a Widget content area is defined as any region whose content is supplied entirely by a Widget and not by the application shell.
5. WHERE `mode` is set to `"dark"` in the App Config, THE App SHALL pass the `"dark"` mode value to the `SaltProvider` so that all Salt Design System components render using the dark mode theme; IF a Widget does not support the Salt dark mode, THEN THE App SHALL render that Widget within its own container without overriding the Widget's default appearance.
6. THE App SHALL not override Salt Design System colour or typography token values via inline styles or local CSS, so that WCAG 2.1 AA colour contrast ratios provided by the Salt Design System theme tokens are preserved.

---

### Requirement 14: Application Bootstrap and Configuration Loading

**User Story:** As a developer, I want the app to load its configuration from a known location at startup, so that I can maintain a single source of truth for the entire dashboard structure.

#### Acceptance Criteria

1. WHEN the App starts, THE App SHALL load its primary Config from the TypeScript module at `src/config/dashboard.config.ts` before rendering any dashboard content.
2. WHEN `dashboard.config.ts` exports a Config object that satisfies the Config type definition, THE App SHALL use it to initialise all Pages, Data Sources, and global settings before the first render.
3. WHEN `dashboard.config.ts` is absent, fails to import, or exports a value that does not satisfy the Config type definition, THE App SHALL halt rendering and display a fatal error screen that identifies the file path and describes the specific problem encountered.
4. IF the Config object is present and importable but contains one or more fields with invalid values (e.g. a required field is `undefined` or of the wrong primitive type), THEN THE App SHALL display the fatal error screen listing each invalid field name and the reason it failed validation.
5. THE App SHALL export a named TypeScript type `DashboardConfig` representing the complete Config schema so that config authors receive compile-time type checking.
6. THE Config schema type SHALL include JSDoc comments on every top-level and nested field so that IDE tooling surfaces inline documentation for each property.

---

### Requirement 15: Project Structure and Developer Experience

**User Story:** As a developer, I want the project to follow a clear structure with Vite as the build tool, so that I can build, develop, and extend the app efficiently.

#### Acceptance Criteria

1. THE App SHALL be a Vite project using the React + TypeScript template with `"node": ">=24.0.0"` declared in the `engines` field of `package.json`.
2. THE App SHALL include a `dev` script that starts the Vite development server.
3. THE App SHALL include a `build` script that produces a static bundle in `dist/` containing at minimum `index.html` and one or more hashed asset files.
4. THE App SHALL include a `preview` script that serves the production bundle locally.
5. THE App SHALL include a `test` script that runs the test suite via Vitest.
6. THE App SHALL be structured with the following top-level `src/` directories: `components/`, `widgets/`, `config/`, `data/`, `hooks/`, `pages/`, `types/`.
7. THE App SHALL support adding a new Widget type by creating a new file in `src/widgets/` and registering it in `src/widgets/registry.ts`; no existing Widget, Page, or application shell source file SHALL require modification to recognise the new Widget type.

---

### Requirement 16: Dynamic Route Parameters

**User Story:** As a dashboard author, I want to define pages with dynamic URL segments, so that a single page config can serve parameterised views (e.g. a detail page for any order or user).

#### Acceptance Criteria

1. THE Config SHALL allow a Page entry's `path` field to include one or more named dynamic segments using `:paramName` syntax (e.g. `/orders/:orderId`, `/reports/:reportId/detail`), where each `paramName` must be a non-empty string containing only alphanumeric characters and underscores.
2. WHEN a user navigates to a URL that matches a Page with dynamic segments, THE App SHALL extract all named route parameter values from the URL and make them available to all Widgets and Filters on that Page for the duration of that render.
3. WHEN a Widget or Filter Config entry includes a `routeParams` array of param name strings, THE App SHALL pass the current value of each listed param to the Data_Adapter as part of the fetch params for that Widget or Filter's Data_Source.
4. IF a param name listed in a Widget or Filter's `routeParams` array is absent from the current URL (e.g. the page was reached via a path that did not supply that segment), THEN THE App SHALL pass `undefined` for that param to the Data_Adapter, and THE Widget or Filter SHALL render its loading or empty state gracefully without throwing an error.
5. THE App SHALL represent all route parameter values as strings, matching React Router's native param type; no type coercion SHALL be applied by the App before passing param values to the Data_Adapter.
6. WHEN two or more Page entries have `path` values that would match the same URL (e.g. `/orders/:orderId` and `/orders/:id`), THE App SHALL log a warning identifying the conflicting paths and SHALL render only the first matching Page entry.
