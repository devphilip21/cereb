import { signalPool } from "../../core/signal-pool.js";
import {
  createDefaultSinglePointerValue,
  resetSinglePointerValue,
  SINGLE_POINTER_SIGNAL_KIND,
  type SinglePointerSignal,
} from "./single-pointer-signal.js";

signalPool.registerKind(
  SINGLE_POINTER_SIGNAL_KIND,
  {
    createValue: createDefaultSinglePointerValue,
    resetValue: resetSinglePointerValue,
  },
  {
    initialSize: 20,
    maxSize: 100,
  },
);

export function acquireSinglePointerSignal(): SinglePointerSignal {
  return signalPool.acquire(SINGLE_POINTER_SIGNAL_KIND);
}

export function releaseSinglePointerSignal(signal: SinglePointerSignal): void {
  signalPool.release(signal);
}
