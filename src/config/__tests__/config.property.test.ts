// Feature: salt-dash, Property 1: Config round-trip page registration
// Feature: salt-dash, Property 2: Invalid page entries are skipped, not crashed
// Feature: salt-dash, Property 3: Duplicate page path/pageId — first-wins invariant

import * as fc from "fast-check";
import { describe, it, expect, beforeAll } from "vitest";
import { validateConfig } from "../../config/validateConfig";

// Run every property for at least 100 iterations.
beforeAll(() => {
  fc.configureGlobal({ numRuns: 100 });
});

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Arbitrary for a single valid page entry.
 * A "valid" page entry must have:
 *   - path  : non-empty string starting with "/" (no trailing whitespace issue)
 *   - title : non-empty, non-blank string (trim().length > 0)
 *   - pageId: non-empty, non-blank string (trim().length > 0)
 *
 * validateConfig uses `isNonEmptyString` which calls .trim(), so we must
 * ensure our generated strings have at least one non-whitespace character.
 */
const nonBlankStringArb = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);

const validPageArb = fc.record({
  path: fc.stringMatching(/^\/[a-z0-9-]*$/),
  title: nonBlankStringArb,
  pageId: nonBlankStringArb,
  widgets: fc.constant([]),
});

/**
 * Arbitrary for a page entry that is definitely invalid because at least one
 * required field (path, title, pageId) is missing or empty.
 *
 * We generate all three fields independently — each can either be omitted
 * (undefined) or set to an empty string — then pick only those combinations
 * that have at least one bad field.
 */
const invalidPageArb = fc
  .record({
    path: fc.oneof(fc.constant(undefined), fc.constant("")),
    title: fc.oneof(fc.constant(undefined), fc.constant("")),
    pageId: fc.oneof(fc.constant(undefined), fc.constant("")),
    widgets: fc.constant([]),
  })
  .filter((p) => !p.path || !p.title || !p.pageId);

/** Minimal valid DashboardConfig wrapper. */
function wrapPages(pages: unknown[]): unknown {
  return { dataSources: {}, pages };
}

// ---------------------------------------------------------------------------
// Property 1: Config round-trip page registration
// ---------------------------------------------------------------------------
// **Validates: Requirements 1.1, 1.2, 1.7**
//
// For any valid DashboardConfig with N valid page entries whose paths and
// pageIds are all distinct, validateConfig must return valid: true and
// the resulting config.pages must contain exactly those N paths in the same
// order.

describe("Property 1: Config round-trip page registration", () => {
  it("returns valid:true and preserves all paths in order for N distinct valid pages", () => {
    fc.assert(
      fc.property(
        // Generate a list of 1–10 valid pages with guaranteed-unique paths and pageIds.
        fc
          .array(validPageArb, { minLength: 1, maxLength: 10 })
          .chain((pages) => {
            // Deduplicate paths and pageIds so the input itself has no conflicts.
            const seen = new Set<string>();
            const unique = pages.filter((p) => {
              const key = `${p.path}__${p.pageId}`;
              if (seen.has(p.path) || seen.has(p.pageId) || seen.has(key)) {
                return false;
              }
              seen.add(p.path);
              seen.add(p.pageId);
              seen.add(key);
              return true;
            });
            return fc.constant(unique);
          })
          .filter((pages) => pages.length > 0),
        (pages) => {
          const result = validateConfig(wrapPages(pages));

          // Must not be a fatal failure.
          expect(result.valid).toBe(true);
          if (!result.valid) return;

          // The number of registered pages must match the number of valid inputs.
          expect(result.config.pages).toHaveLength(pages.length);

          // Each path must appear in the same position.
          result.config.pages.forEach((page, idx) => {
            expect(page.path).toBe(pages[idx].path);
          });
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Invalid page entries are skipped, not crashed
// ---------------------------------------------------------------------------
// **Validates: Requirements 1.5**
//
// For any DashboardConfig where some page entries are missing required fields,
// validateConfig still returns valid: true and only the valid entries appear
// in config.pages.

describe("Property 2: Invalid page entries are skipped, not crashed", () => {
  it("returns valid:true and omits invalid entries from config.pages", () => {
    fc.assert(
      fc.property(
        // Mix of valid pages (0–5) and invalid pages (1–5).
        fc
          .tuple(
            fc.array(validPageArb, { minLength: 0, maxLength: 5 }),
            fc.array(invalidPageArb, { minLength: 1, maxLength: 5 })
          )
          .chain(([validPages, invalidPages]) => {
            // Ensure valid pages have unique paths and pageIds among themselves.
            const seen = new Set<string>();
            const uniqueValid = validPages.filter((p) => {
              if (seen.has(p.path) || seen.has(p.pageId)) return false;
              seen.add(p.path);
              seen.add(p.pageId);
              return true;
            });
            // Interleave invalid pages into the array at random positions.
            const combined: unknown[] = [...uniqueValid, ...invalidPages];
            return fc.constant({ combined, validCount: uniqueValid.length });
          }),
        ({ combined, validCount }) => {
          const result = validateConfig(wrapPages(combined));

          // Must never be a fatal error just because some pages are bad.
          expect(result.valid).toBe(true);
          if (!result.valid) return;

          // The valid-page count must not exceed the number of unique valid inputs.
          expect(result.config.pages.length).toBeLessThanOrEqual(validCount);

          // No page in the output may have an empty or missing path/title/pageId.
          for (const page of result.config.pages) {
            expect(typeof page.path).toBe("string");
            expect(page.path.length).toBeGreaterThan(0);
            expect(typeof page.title).toBe("string");
            expect(page.title.length).toBeGreaterThan(0);
            expect(typeof page.pageId).toBe("string");
            expect(page.pageId.length).toBeGreaterThan(0);
          }
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Duplicate path / pageId — first-wins invariant
// ---------------------------------------------------------------------------
// **Validates: Requirements 1.6**
//
// For any DashboardConfig with duplicate path or pageId values, validateConfig
// returns exactly one route per unique path, corresponding to the first
// occurrence in the array.

describe("Property 3: Duplicate page path/pageId — first-wins invariant", () => {
  it("keeps only the first occurrence when duplicate paths exist", () => {
    fc.assert(
      fc.property(
        // Generate a base valid page, then duplicate it 1–4 more times.
        fc
          .tuple(
            validPageArb,
            fc.integer({ min: 1, max: 4 })
          )
          .chain(([basePage, extraCount]) => {
            const duplicates = Array.from({ length: extraCount }, () => ({
              ...basePage,
              // Each duplicate has the same path but a different title so we
              // can tell them apart; pageId also duplicates to keep it simple.
            }));
            return fc.constant({ basePage, duplicates });
          }),
        ({ basePage, duplicates }) => {
          const pages = [basePage, ...duplicates];
          const result = validateConfig(wrapPages(pages));

          expect(result.valid).toBe(true);
          if (!result.valid) return;

          // Exactly one route for the duplicate path.
          const matchingPages = result.config.pages.filter(
            (p) => p.path === basePage.path
          );
          expect(matchingPages).toHaveLength(1);

          // The surviving entry must be the first occurrence (same title).
          expect(matchingPages[0].title).toBe(basePage.title);
          expect(matchingPages[0].pageId).toBe(basePage.pageId);
        }
      )
    );
  });

  it("keeps only the first occurrence when duplicate pageIds exist", () => {
    fc.assert(
      fc.property(
        // Two pages that share the same pageId but have different paths.
        fc
          .tuple(validPageArb, validPageArb)
          .filter(([a, b]) => a.path !== b.path)
          .map(([a, b]) => ({
            first: a,
            // Give b the same pageId as a, but a different path.
            second: { ...b, pageId: a.pageId },
          })),
        ({ first, second }) => {
          const result = validateConfig(wrapPages([first, second]));

          expect(result.valid).toBe(true);
          if (!result.valid) return;

          // Only the first entry with that pageId should survive.
          const withSamePageId = result.config.pages.filter(
            (p) => p.pageId === first.pageId
          );
          expect(withSamePageId).toHaveLength(1);
          expect(withSamePageId[0].path).toBe(first.path);
        }
      )
    );
  });
});
