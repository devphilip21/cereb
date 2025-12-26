import { getCerebDeviceId } from "./meta.js";

export interface Signal<K extends string = string, V = unknown> {
  readonly kind: K;
  readonly value: V;
  readonly deviceId: string;
  readonly createdAt: number;
  readonly updatedAt?: number;
}

/**
 * Utility type to extend a Signal's value type with additional properties.
 * Used by operators that add computed properties to signals.
 */
export type ExtendSignalValue<T extends Signal, Additional> = Signal<
  T["kind"],
  T["value"] & Additional
>;

/**
 * Utility type to constrain a Signal to have specific value properties.
 * Used by operators that require certain properties in the input signal.
 */
export type SignalWith<V> = Signal<string, V>;

export function createSignal<K extends string = string, V = unknown>(
  kind: K,
  value: V,
): Signal<K, V> {
  return {
    kind,
    value,
    deviceId: getCerebDeviceId(),
    createdAt: performance.now(),
  };
}
