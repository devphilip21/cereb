import type { Signal } from "cereb";
import { createSignal } from "../../cereb/src/core/signal.js";
import type { DeepMutable } from "../../cereb/src/internal/types.js";
import type { PanDirection, PanPhase } from "./pan-types.js";

/**
 * Pan gesture event emitted during pan lifecycle (start, change, end, cancel).
 * Contains position deltas, cumulative distance, and direction information.
 *
 * Use withVelocity() operator to add velocity data:
 * @example
 * ```typescript
 * pipe(source, singlePointerToPan(), withVelocity()).subscribe(event => {
 *   console.log(event.velocityX); // available after withVelocity()
 * });
 * ```
 */
export interface PanValue {
  phase: PanPhase;

  /** X displacement from start point */
  deltaX: number;
  /** Y displacement from start point */
  deltaY: number;

  /** Total cumulative distance traveled */
  distance: number;

  /** Current movement direction */
  direction: PanDirection;

  /** Current clientX */
  x: number;
  /** Current clientY */
  y: number;
  /** Current pageX */
  pageX: number;
  /** Current pageY */
  pageY: number;
}

export interface PanSignal<T = {}> extends Signal<"pan", PanValue & T> {}

export const PAN_SIGNAL_KIND = "pan" as const;

export function createDefaultPanValue(): PanValue {
  return {
    phase: "unknown",
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    direction: "none",
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
  };
}

export function createDefaultPanSignal(): PanSignal {
  return createSignal(PAN_SIGNAL_KIND, createDefaultPanValue());
}

export function resetPanValue(value: PanValue): void {
  const v = value as DeepMutable<PanValue>;
  v.phase = "unknown";
  v.deltaX = 0;
  v.deltaY = 0;
  v.distance = 0;
  v.direction = "none";
  v.x = 0;
  v.y = 0;
  v.pageX = 0;
  v.pageY = 0;
}
