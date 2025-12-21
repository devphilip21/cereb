export type {
  MouseEmitter,
  MouseEmitterOptions,
  MouseEventsToSinglePointerOptions,
} from "./mouse.js";
export {
  createMouseEmitter,
  mouseEventsToSinglePointer,
} from "./mouse.js";
export type {
  PointerEmitter,
  PointerEmitterOptions,
  SinglePointerOptions,
  ToSinglePointerOptions,
} from "./pointer.js";
export {
  createPointerEmitter,
  pointerEventsToSinglePointer,
  singlePointer,
} from "./pointer.js";

export { releaseSinglePointer, singlePointerPool } from "./pool.js";
export type { SinglePointer } from "./signal.js";
export {
  createDefaultSinglePointer,
  isSinglePointer,
  resetSinglePointer,
} from "./signal.js";

export type {
  TouchEmitter,
  TouchEmitterOptions,
  TouchEventsToSinglePointerOptions,
  TouchSinglePointerOptions,
} from "./touch.js";
export {
  createTouchEmitter,
  touchEventsToSinglePointer,
} from "./touch.js";
export type { PointerButton, PointerPhase, PointerType } from "./types.js";
export { toPointerButton } from "./types.js";

export {
  eventTypeToPhase,
  getButton,
  getDeviceId,
  normalizePointerType,
} from "./utils.js";
