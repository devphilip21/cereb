import { createObjectPool } from "../../internal/object-pool.js";
import {
  createDefaultSinglePointerSignal,
  resetSinglePointerSignal,
  type SinglePointerSignal,
} from "./single-pointer-signal.js";

export const singlePointerPool = createObjectPool<SinglePointerSignal>(
  createDefaultSinglePointerSignal,
  resetSinglePointerSignal,
  {
    initialSize: 20,
    maxSize: 100,
  },
);

export function releaseSinglePointer(signal: SinglePointerSignal): void {
  singlePointerPool.release(signal);
}
