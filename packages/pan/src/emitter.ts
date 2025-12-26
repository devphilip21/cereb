import type { SinglePointerSignal } from "cereb";
import type { DeepMutable } from "../../cereb/src/internal/types.js";
import { calculateDistance, getDirection } from "./geometry.js";
import type { PanSignal, PanValue } from "./pan-signal.js";
import type { PanDirectionMode, PanOptions, PanPhase } from "./pan-types.js";
import { acquirePanSignal, releasePanSignal } from "./pool.js";
import { createInitialPanState, type PanState, resetPanState } from "./state.js";

const DEFAULT_THRESHOLD = 10;

/**
 * Stateful processor that transforms SinglePointer events into PanSignal.
 * Can be used imperatively or integrated into custom pipelines.
 */
export interface PanEmitter {
  process(pointer: SinglePointerSignal): PanSignal | null;
  readonly isActive: boolean;
  readonly thresholdMet: boolean;
  reset(): void;
  dispose(): void;
}

function isThresholdMet(
  deltaX: number,
  deltaY: number,
  threshold: number,
  direction: PanDirectionMode,
): boolean {
  switch (direction) {
    case "horizontal":
      return Math.abs(deltaX) >= threshold;
    case "vertical":
      return Math.abs(deltaY) >= threshold;
    default:
      return Math.abs(deltaX) >= threshold || Math.abs(deltaY) >= threshold;
  }
}

/**
 * Creates a pan gesture emitter that processes SinglePointer events.
 *
 * The emitter maintains internal state and can be used:
 * - Imperatively via process() method
 * - With any event source (not just Observable streams)
 * - In Web Workers or other non-DOM contexts
 *
 * @example
 * ```typescript
 * const emitter = createPanEmitter({ threshold: 10 });
 *
 * element.addEventListener('pointermove', (e) => {
 *   const pointer = toSinglePointer(e);
 *   const panEvent = emitter.process(pointer);
 *   if (panEvent) {
 *     console.log(panEvent.deltaX, panEvent.velocityX);
 *   }
 * });
 * ```
 */
export function createPanEmitter(options: PanOptions = {}): PanEmitter {
  const { threshold = DEFAULT_THRESHOLD, direction = "all" } = options;
  const state: PanState = createInitialPanState();
  let current: PanSignal | null = null;

  function releaseCurrentSignal(): void {
    if (current) {
      releasePanSignal(current);
    }
    current = null;
  }

  function createPanSignalFromPointer(
    pointerSignal: SinglePointerSignal,
    phase: PanPhase,
  ): PanSignal {
    releaseCurrentSignal();
    const signal = acquirePanSignal();

    const deltaX = pointerSignal.value.x - state.startX;
    const deltaY = pointerSignal.value.y - state.startY;

    const v = signal.value as DeepMutable<PanValue>;
    v.phase = phase;
    v.deltaX = deltaX;
    v.deltaY = deltaY;
    v.distance = state.totalDistance;
    v.direction = getDirection(deltaX, deltaY);
    v.x = pointerSignal.value.x;
    v.y = pointerSignal.value.y;
    v.pageX = pointerSignal.value.pageX;
    v.pageY = pointerSignal.value.pageY;

    current = signal;
    return signal;
  }

  function handleStart(signal: SinglePointerSignal): null {
    state.isActive = true;
    state.thresholdMet = false;
    state.startX = signal.value.x;
    state.startY = signal.value.y;
    state.startTimestamp = signal.createdAt;
    state.prevX = signal.value.x;
    state.prevY = signal.value.y;
    state.prevTimestamp = signal.createdAt;
    state.totalDistance = 0;
    state.deviceId = signal.deviceId;
    return null;
  }

  function handleMove(signal: SinglePointerSignal): PanSignal | null {
    if (!state.isActive) return null;

    const deltaX = signal.value.x - state.startX;
    const deltaY = signal.value.y - state.startY;

    const segmentDistance = calculateDistance(
      state.prevX,
      state.prevY,
      signal.value.x,
      signal.value.y,
    );
    state.totalDistance += segmentDistance;

    let result: PanSignal | null = null;

    if (!state.thresholdMet) {
      if (isThresholdMet(deltaX, deltaY, threshold, direction)) {
        state.thresholdMet = true;
        result = createPanSignalFromPointer(signal, "start");
      }
    } else {
      result = createPanSignalFromPointer(signal, "move");
    }

    state.prevX = signal.value.x;
    state.prevY = signal.value.y;
    state.prevTimestamp = signal.createdAt;

    return result;
  }

  function handleEnd(signal: SinglePointerSignal): PanSignal | null {
    if (!state.isActive) return null;

    let result: PanSignal | null = null;

    if (state.thresholdMet) {
      result = createPanSignalFromPointer(signal, "end");
    }

    resetPanState(state);
    return result;
  }

  function handleCancel(signal: SinglePointerSignal): PanSignal | null {
    if (!state.isActive) return null;

    let result: PanSignal | null = null;
    if (state.thresholdMet) {
      result = createPanSignalFromPointer(signal, "cancel");
    }

    resetPanState(state);
    return result;
  }

  return {
    process(signal: SinglePointerSignal): PanSignal | null {
      switch (signal.value.phase) {
        case "start":
          return handleStart(signal);
        case "move":
          return handleMove(signal);
        case "end":
          return handleEnd(signal);
        case "cancel":
          return handleCancel(signal);
        default:
          return null;
      }
    },

    get isActive(): boolean {
      return state.isActive;
    },

    get thresholdMet(): boolean {
      return state.thresholdMet;
    },

    reset(): void {
      releaseCurrentSignal();
      resetPanState(state);
    },

    dispose(): void {
      releaseCurrentSignal();
      resetPanState(state);
    },
  };
}
