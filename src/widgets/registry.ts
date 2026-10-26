import type { ComponentType } from "react";
import type { BaseWidgetConfig } from "../types/widgets";

export type WidgetComponent<T extends BaseWidgetConfig = BaseWidgetConfig> =
  ComponentType<{ config: T }>;

const registry = new Map<string, WidgetComponent<any>>();

export function registerWidget<T extends BaseWidgetConfig>(
  widgetType: string,
  component: WidgetComponent<T>
): void {
  registry.set(widgetType, component);
}

export function resolveWidget(widgetType: string): WidgetComponent | undefined {
  return registry.get(widgetType);
}
