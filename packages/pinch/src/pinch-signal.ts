import type { Signal } from "cereb";
import { createSignal } from "cereb";
import type { PinchPhase } from "./pinch-types.js";

/**
 * Pure distance-based pinch gesture value.
 * Scale/zoom calculations are delegated to zoom() operator in cereb.
 */
export interface PinchValue {
  phase: PinchPhase;

  /** Distance between two pointers at gesture start */
  initialDistance: number;

  /** Current distance between two pointers */
  distance: number;

  /** Ratio of current distance to initial distance */
  ratio: number;

  /** Distance change since last event */
  deltaDistance: number;

  /** Velocity of distance change (pixels per millisecond) */
  velocity: number;

  /** Center X between two pointers (client coordinates) */
  centerX: number;

  /** Center Y between two pointers (client coordinates) */
  centerY: number;

  /** Center X between two pointers (page coordinates) */
  pageCenterX: number;

  /** Center Y between two pointers (page coordinates) */
  pageCenterY: number;
}

export interface PinchSignal<T = {}> extends Signal<"pinch", PinchValue & T> {}

export const PINCH_SIGNAL_KIND = "pinch" as const;

export function createDefaultPinchValue(): PinchValue {
  return {
    phase: "unknown",
    initialDistance: 0,
    distance: 0,
    ratio: 0,
    deltaDistance: 0,
    velocity: 0,
    centerX: 0,
    centerY: 0,
    pageCenterX: 0,
    pageCenterY: 0,
  };
}

export function createPinchSignal(value: PinchValue): PinchSignal {
  return createSignal(PINCH_SIGNAL_KIND, value);
}
