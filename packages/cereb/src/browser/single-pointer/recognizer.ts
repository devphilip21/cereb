import type { Signal } from "../../core/signal.js";
import { acquireSinglePointerSignal, releaseSinglePointerSignal } from "./pool.js";
import type { SinglePointerSignal } from "./single-pointer-signal.js";
import type { SinglePointerOptions } from "./types.js";

export interface SinglePointerRecognizer<InputSignal extends Signal> {
  process(event: InputSignal): SinglePointerSignal;
  readonly isActive: boolean;
  reset(): void;
  dispose(): void;
}

export function createSinglePointerRecognizer<InputSignal extends Signal>(
  processor: (inputSignal: InputSignal, pointerSignal: SinglePointerSignal) => void,
  _options: SinglePointerOptions = {},
): SinglePointerRecognizer<InputSignal> {
  let current: SinglePointerSignal | null = null;

  function releaseCurrentPointer(): void {
    if (current) {
      releaseSinglePointerSignal(current);
    }
    current = null;
  }

  return {
    process: (inputSignal) => {
      const signal = acquireSinglePointerSignal();
      processor(inputSignal, signal);
      releaseCurrentPointer();
      current = signal;
      return signal;
    },
    get isActive(): boolean {
      return current !== null;
    },
    reset(): void {
      releaseCurrentPointer();
    },
    dispose(): void {
      this.reset();
    },
  };
}
