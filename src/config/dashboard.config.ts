import type { DashboardConfig } from "../types/config";

/**
 * Root Salt Dash configuration.
 * Edit this file to add, remove, or rearrange pages and widgets without
 * touching any application code.
 */
const config: DashboardConfig = {
  mode: "light",

  // -------------------------------------------------------------------------
  // Data sources
  // Each key must match the `dataSourceId` used by a widget or filter below.
  // -------------------------------------------------------------------------
  dataSources: {
    "chart-data": {
      type: "mock",
      dataSourceId: "chart-data",
      filePath: "src/data/mock/chart-data.json",
    },
    "table-data": {
      type: "mock",
      dataSourceId: "table-data",
      filePath: "src/data/mock/table-data.json",
    },
    "kpi-data": {
      type: "mock",
      dataSourceId: "kpi-data",
      filePath: "src/data/mock/kpi-data.json",
    },
    "api-kpi-data": {
      type: "api",
      dataSourceId: "api-kpi-data",
      endpoint: "/api/kpi",
    },
    "text-data": {
      type: "mock",
      dataSourceId: "text-data",
      filePath: "src/data/mock/text-data.json",
    },
  },

  // -------------------------------------------------------------------------
  // Pages
  // -------------------------------------------------------------------------
  pages: [
    {
      pageId: "dashboard-overview",
      path: "/",
      title: "Dashboard Overview",
      columns: 12,
      header: {
        title: "Salt Dash",
        subtitle: "Config-driven dashboard",
      },
      breadcrumbs: [{ label: "Home" }],
      widgets: [
        // Chart widget — bar chart of monthly revenue
        {
          widgetId: "chart-1",
          widgetType: "chart",
          chartType: "bar",
          dataSourceId: "chart-data",
          xField: "month",
          yField: "revenue",
          colSpan: 6,
        },
        // Table widget — data grid with pagination
        {
          widgetId: "table-1",
          widgetType: "table",
          dataSourceId: "table-data",
          columns: [
            { field: "id", headerName: "ID" },
            { field: "name", headerName: "Name" },
            { field: "status", headerName: "Status" },
          ],
          pageSize: 5,
          colSpan: 6,
        },
        // KPI card widget — total revenue metric
        {
          widgetId: "kpi-1",
          widgetType: "kpi",
          dataSourceId: "kpi-data",
          valueField: "revenue",
          label: "Total Revenue",
          trendField: "trend",
          prefix: "$",
          colSpan: 4,
        },
        // Text widget — static Markdown welcome message
        {
          widgetId: "text-1",
          widgetType: "text",
          content:
            "## Welcome\n\nThis is a **Salt Dash** example dashboard.",
          colSpan: 8,
        },
      ],
    },
  ],
};

export default config;
