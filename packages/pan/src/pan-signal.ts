import type { Signal } from "cereb";
import { createSignal } from "cereb";
import type { PanDirection, PanPhase } from "./pan-types.js";

/**
 * Pan gesture value emitted during pan lifecycle (start, move, end, cancel).
 * Contains position deltas, velocity, cumulative distance, and direction information.
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

  /** X velocity in pixels per millisecond */
  velocityX: number;
  /** Y velocity in pixels per millisecond */
  velocityY: number;

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
    velocityX: 0,
    velocityY: 0,
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
  };
}

export function createDefaultPanSignal(): PanSignal {
  return createSignal(PAN_SIGNAL_KIND, createDefaultPanValue());
}

export function createPanSignal(value: PanValue): PanSignal {
  return createSignal(PAN_SIGNAL_KIND, value);
}
