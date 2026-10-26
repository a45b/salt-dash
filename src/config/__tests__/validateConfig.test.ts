/**
 * Unit tests for `validateConfig`.
 *
 * Covers:
 *  - Valid config passes with no errors
 *  - Missing required page fields (path, title, pageId) — per entry and index
 *  - Duplicate path across pages — first kept, error emitted
 *  - Duplicate pageId across pages — first kept, error emitted
 *  - columns outside 1–24 — non-fatal, entry uses default (columns omitted)
 *  - Config that is not a plain object — fatal, returns { valid: false, errors }
 *  - Missing dataSources — fatal
 *  - Missing pages — fatal
 *  - Widget with empty widgetId is skipped
 *
 * Requirements: 1.2, 1.5, 1.6
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateConfig } from "../../config/validateConfig";
import type { DashboardConfig } from "../../types/config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid page entry. */
function makePage(overrides: Record<string, unknown> = {}) {
  return {
    pageId: "page-1",
    path: "/dashboard",
    title: "Dashboard",
    widgets: [],
    ...overrides,
  };
}

/** Minimal valid config object. */
function makeConfig(overrides: Record<string, unknown> = {}): unknown {
  return {
    dataSources: {},
    pages: [makePage()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("validateConfig", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  describe("valid config", () => {
    it("returns { valid: true, config: DashboardConfig } for a minimal valid config", () => {
      const raw = makeConfig();
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return; // narrow type

      expect(result.config).toBeDefined();
      expect(result.config.pages).toHaveLength(1);
      expect(result.config.pages[0].pageId).toBe("page-1");
      expect(result.config.pages[0].path).toBe("/dashboard");
      expect(result.config.pages[0].title).toBe("Dashboard");
    });

    it("preserves optional theme and mode fields in the returned config", () => {
      const raw = makeConfig({ theme: "my-theme", mode: "dark" });
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect((result.config as DashboardConfig).theme).toBe("my-theme");
      expect((result.config as DashboardConfig).mode).toBe("dark");
    });

    it("returns all valid pages when multiple distinct pages are present", () => {
      const raw = makeConfig({
        pages: [
          makePage({ pageId: "p1", path: "/a", title: "Page A" }),
          makePage({ pageId: "p2", path: "/b", title: "Page B" }),
        ],
      });

      const result = validateConfig(raw);
      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect(result.config.pages).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Fatal errors — not a plain object
  // -------------------------------------------------------------------------

  describe("fatal: config is not a plain object", () => {
    it.each([
      ["null", null],
      ["a string", "hello"],
      ["a number", 42],
      ["an array", [{ dataSources: {}, pages: [] }]],
      ["undefined", undefined],
    ])("returns { valid: false, errors } when config is %s", (_label, value) => {
      const result = validateConfig(value);

      expect(result.valid).toBe(false);
      if (result.valid) return;

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toBe("(root)");
    });
  });

  // -------------------------------------------------------------------------
  // Fatal errors — missing dataSources
  // -------------------------------------------------------------------------

  describe("fatal: missing dataSources", () => {
    it("returns { valid: false, errors } when dataSources is absent", () => {
      const raw = { pages: [makePage()] };
      const result = validateConfig(raw);

      expect(result.valid).toBe(false);
      if (result.valid) return;

      const dsError = result.errors.find((e) => e.path === "dataSources");
      expect(dsError).toBeDefined();
      expect(dsError!.message).toContain("dataSources");
    });

    it("returns { valid: false, errors } when dataSources is not an object", () => {
      const raw = makeConfig({ dataSources: "not-an-object" });
      const result = validateConfig(raw);

      expect(result.valid).toBe(false);
      if (result.valid) return;

      const dsError = result.errors.find((e) => e.path === "dataSources");
      expect(dsError).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Fatal errors — missing pages
  // -------------------------------------------------------------------------

  describe("fatal: missing pages", () => {
    it("returns { valid: false, errors } when pages is absent", () => {
      const raw = { dataSources: {} };
      const result = validateConfig(raw);

      expect(result.valid).toBe(false);
      if (result.valid) return;

      const pagesError = result.errors.find((e) => e.path === "pages");
      expect(pagesError).toBeDefined();
      expect(pagesError!.message).toContain("pages");
    });

    it("returns { valid: false, errors } when pages is not an array", () => {
      const raw = makeConfig({ pages: { 0: makePage() } });
      const result = validateConfig(raw);

      expect(result.valid).toBe(false);
      if (result.valid) return;

      const pagesError = result.errors.find((e) => e.path === "pages");
      expect(pagesError).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Non-fatal: missing required page fields
  // -------------------------------------------------------------------------

  describe("missing required page fields", () => {
    it("skips the entry and logs an error that identifies 'path' when path is missing", () => {
      const raw = makeConfig({
        pages: [makePage({ path: undefined })],
      });
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      // The page should be skipped
      expect(result.config.pages).toHaveLength(0);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("path")
      );
    });

    it("logs the entry index (0) when the first page entry is missing path", () => {
      const raw = makeConfig({
        pages: [
          makePage({ path: undefined }),
          makePage({ pageId: "p2", path: "/b", title: "B" }),
        ],
      });
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      // Only the second (valid) page is kept
      expect(result.config.pages).toHaveLength(1);
      expect(result.config.pages[0].pageId).toBe("p2");

      // Error message must reference index 0
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/pages\[0\]/)
      );
    });

    it("skips the entry and logs an error that identifies 'title' when title is missing", () => {
      const raw = makeConfig({
        pages: [makePage({ title: undefined })],
      });
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect(result.config.pages).toHaveLength(0);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("title")
      );
    });

    it("skips the entry and logs an error that identifies 'pageId' when pageId is missing", () => {
      const raw = makeConfig({
        pages: [makePage({ pageId: undefined })],
      });
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect(result.config.pages).toHaveLength(0);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("pageId")
      );
    });

    it("includes the affected entry index in the error for the second page (index 1)", () => {
      const raw = makeConfig({
        pages: [
          makePage({ pageId: "p1", path: "/a", title: "A" }),
          makePage({ pageId: undefined, path: "/b", title: "B" }),
        ],
      });
      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect(result.config.pages).toHaveLength(1);
      expect(result.config.pages[0].pageId).toBe("p1");

      // Error must reference index 1
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/pages\[1\]/)
      );
    });
  });

  // -------------------------------------------------------------------------
  // Non-fatal: duplicate path
  // -------------------------------------------------------------------------

  describe("duplicate path across pages", () => {
    it("keeps only the first page with a given path and logs an error containing the conflicting value", () => {
      const sharedPath = "/shared";
      const raw = makeConfig({
        pages: [
          makePage({ pageId: "first", path: sharedPath, title: "First" }),
          makePage({ pageId: "second", path: sharedPath, title: "Second" }),
        ],
      });

      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      // Only the first page should survive
      expect(result.config.pages).toHaveLength(1);
      expect(result.config.pages[0].pageId).toBe("first");

      // Error must mention the conflicting path value
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(sharedPath)
      );
    });

    it("still includes all other unique pages when one duplicate path is present", () => {
      const raw = makeConfig({
        pages: [
          makePage({ pageId: "p1", path: "/dup", title: "A" }),
          makePage({ pageId: "p2", path: "/dup", title: "B" }),
          makePage({ pageId: "p3", path: "/unique", title: "C" }),
        ],
      });

      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect(result.config.pages).toHaveLength(2);
      expect(result.config.pages.map((p) => p.pageId)).toEqual(["p1", "p3"]);
    });
  });

  // -------------------------------------------------------------------------
  // Non-fatal: duplicate pageId
  // -------------------------------------------------------------------------

  describe("duplicate pageId across pages", () => {
    it("keeps only the first page with a given pageId and logs an error containing the conflicting value", () => {
      const sharedId = "duplicated-id";
      const raw = makeConfig({
        pages: [
          makePage({ pageId: sharedId, path: "/a", title: "First" }),
          makePage({ pageId: sharedId, path: "/b", title: "Second" }),
        ],
      });

      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      // Only the first page survives
      expect(result.config.pages).toHaveLength(1);
      expect(result.config.pages[0].path).toBe("/a");

      // Error must mention the conflicting pageId value
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(sharedId)
      );
    });
  });

  // -------------------------------------------------------------------------
  // Non-fatal: columns outside 1–24
  // -------------------------------------------------------------------------

  describe("columns outside 1–24", () => {
    it("is non-fatal — returns valid: true and the entry is kept", () => {
      const raw = makeConfig({
        pages: [makePage({ columns: 0 })],
      });

      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      // Page is kept (entry is not skipped)
      expect(result.config.pages).toHaveLength(1);
    });

    it("omits the columns field from the cleaned page when the value is below the valid range", () => {
      const raw = makeConfig({
        pages: [makePage({ columns: 0 })],
      });

      const result = validateConfig(raw);
      if (!result.valid) return;

      // columns should be absent — validator drops invalid value, leaving the
      // rendering layer to apply its own default of 12.
      expect(result.config.pages[0].columns).toBeUndefined();
    });

    it("omits the columns field from the cleaned page when the value exceeds 24", () => {
      const raw = makeConfig({
        pages: [makePage({ columns: 25 })],
      });

      const result = validateConfig(raw);
      if (!result.valid) return;

      expect(result.config.pages[0].columns).toBeUndefined();
    });

    it("logs a warning when columns is out of range", () => {
      const raw = makeConfig({
        pages: [makePage({ columns: 99 })],
      });

      validateConfig(raw);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("columns")
      );
    });

    it("accepts a valid columns value (e.g. 12) without warning", () => {
      const raw = makeConfig({
        pages: [makePage({ columns: 12 })],
      });

      const result = validateConfig(raw);
      if (!result.valid) return;

      expect(result.config.pages[0].columns).toBe(12);
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining("columns")
      );
    });
  });

  // -------------------------------------------------------------------------
  // Non-fatal: widget with empty widgetId is skipped
  // -------------------------------------------------------------------------

  describe("widget with empty widgetId is skipped", () => {
    it("skips a widget whose widgetId is an empty string", () => {
      const raw = makeConfig({
        pages: [
          makePage({
            widgets: [
              { widgetId: "", widgetType: "text" },
              { widgetId: "w1", widgetType: "text" },
            ],
          }),
        ],
      });

      const result = validateConfig(raw);

      expect(result.valid).toBe(true);
      if (!result.valid) return;

      expect(result.config.pages[0].widgets).toHaveLength(1);
      expect(result.config.pages[0].widgets[0].widgetId).toBe("w1");
    });

    it("skips a widget whose widgetId is whitespace-only", () => {
      const raw = makeConfig({
        pages: [
          makePage({
            widgets: [
              { widgetId: "   ", widgetType: "text" },
              { widgetId: "w2", widgetType: "text" },
            ],
          }),
        ],
      });

      const result = validateConfig(raw);
      if (!result.valid) return;

      expect(result.config.pages[0].widgets).toHaveLength(1);
      expect(result.config.pages[0].widgets[0].widgetId).toBe("w2");
    });

    it("logs an error when a widget is skipped due to missing widgetId", () => {
      const raw = makeConfig({
        pages: [
          makePage({
            widgets: [{ widgetId: "", widgetType: "text" }],
          }),
        ],
      });

      validateConfig(raw);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("widgetId")
      );
    });

    it("keeps all valid widgets when one widget with an empty widgetId is mixed in", () => {
      const raw = makeConfig({
        pages: [
          makePage({
            widgets: [
              { widgetId: "w1", widgetType: "text" },
              { widgetId: "", widgetType: "kpi" },
              { widgetId: "w2", widgetType: "table", columns: [] },
            ],
          }),
        ],
      });

      const result = validateConfig(raw);
      if (!result.valid) return;

      expect(result.config.pages[0].widgets).toHaveLength(2);
      expect(result.config.pages[0].widgets.map((w) => w.widgetId)).toEqual([
        "w1",
        "w2",
      ]);
    });
  });
});
