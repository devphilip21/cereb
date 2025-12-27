import type { Signal } from "../../core/signal.js";
import {
  createMultiPointerSignal,
  type MultiPointer,
  type MultiPointerPhase,
  type MultiPointerSignal,
  type PointerInfo,
} from "./multi-pointer-signal.js";
import type { MultiPointerOptions } from "./types.js";

export interface MultiPointerRecognizer<InputSignal extends Signal> {
  process(event: InputSignal): MultiPointerSignal | null;
  readonly isActive: boolean;
  readonly activeCount: number;
  reset(): void;
  dispose(): void;
}

/**
 * Result of processing an input event.
 * - null: No signal should be emitted (e.g., pointer ignored due to maxPointers)
 * - pointers: Updated pointer map after processing the event
 */
export interface PointerUpdateResult {
  pointers: Map<string, PointerInfo>;
  endedPointerIds: string[];
}

/**
 * Creates a recognizer that tracks multiple pointers and emits snapshot signals.
 * Maintains internal state of all active pointers using a Map.
 */
export function createMultiPointerRecognizer<InputSignal extends Signal>(
  processor: (
    inputSignal: InputSignal,
    pointerMap: Map<string, PointerInfo>,
    options: Required<MultiPointerOptions>,
  ) => PointerUpdateResult | null,
  options: MultiPointerOptions = {},
): MultiPointerRecognizer<InputSignal> {
  const opts: Required<MultiPointerOptions> = {
    maxPointers: options.maxPointers ?? 2,
  };

  const activePointers = new Map<string, PointerInfo>();
  let previousPhase: MultiPointerPhase = "idle";

  function computePhase(count: number, endedCount: number): MultiPointerPhase {
    if (count === 0) {
      return previousPhase === "active" && endedCount > 0 ? "ended" : "idle";
    }
    return "active";
  }

  return {
    process(inputSignal: InputSignal): MultiPointerSignal | null {
      const result = processor(inputSignal, activePointers, opts);
      if (result === null) {
        return null;
      }

      const endedPointerIds = result.endedPointerIds;
      for (const id of endedPointerIds) {
        activePointers.delete(id);
      }

      const pointers = Array.from(activePointers.values());
      const phase = computePhase(pointers.length, endedPointerIds.length);
      previousPhase = phase === "ended" ? "idle" : phase;

      const multiPointer: MultiPointer = {
        phase,
        pointers,
        count: pointers.length,
      };

      return createMultiPointerSignal(multiPointer);
    },

    get isActive(): boolean {
      return activePointers.size > 0;
    },

    get activeCount(): number {
      return activePointers.size;
    },

    reset(): void {
      activePointers.clear();
      previousPhase = "idle";
    },

    dispose(): void {
      this.reset();
    },
  };
}
