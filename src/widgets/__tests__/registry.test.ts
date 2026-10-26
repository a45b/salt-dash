import { describe, it, expect } from "vitest";
import { registerWidget, resolveWidget } from "../../widgets/registry";
import type { WidgetComponent } from "../../widgets/registry";
import type { BaseWidgetConfig } from "../../types/widgets";

// The registry uses a module-level Map that persists across tests.
// Each test uses a unique widget type name to avoid inter-test contamination.

const stubComponent: WidgetComponent = (() => null) as unknown as WidgetComponent;
const anotherComponent: WidgetComponent = (() => null) as unknown as WidgetComponent;

describe("widget registry", () => {
  describe("registerWidget + resolveWidget round-trip", () => {
    it("resolves the same component that was registered", () => {
      registerWidget("roundtrip-widget-1", stubComponent);
      expect(resolveWidget("roundtrip-widget-1")).toBe(stubComponent);
    });

    it("registered component satisfies the WidgetComponent type", () => {
      const typedComponent: WidgetComponent<BaseWidgetConfig> =
        (() => null) as unknown as WidgetComponent<BaseWidgetConfig>;
      registerWidget("roundtrip-widget-2", typedComponent);
      expect(resolveWidget("roundtrip-widget-2")).toBe(typedComponent);
    });
  });

  describe("resolveWidget for unknown type", () => {
    it("returns undefined for a type that was never registered", () => {
      expect(resolveWidget("unknown-widget-type-xyz")).toBeUndefined();
    });

    it("returns undefined for an empty string type", () => {
      // empty string is a valid Map key but is never registered
      expect(resolveWidget("")).toBeUndefined();
    });
  });

  describe("re-registering the same key overwrites", () => {
    it("returns the second component after re-registration", () => {
      registerWidget("overwrite-widget-1", stubComponent);
      registerWidget("overwrite-widget-1", anotherComponent);
      expect(resolveWidget("overwrite-widget-1")).toBe(anotherComponent);
    });

    it("no longer returns the first component after it is overwritten", () => {
      registerWidget("overwrite-widget-2", stubComponent);
      registerWidget("overwrite-widget-2", anotherComponent);
      expect(resolveWidget("overwrite-widget-2")).not.toBe(stubComponent);
    });
  });
});
