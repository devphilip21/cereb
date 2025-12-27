import type { Stream } from "../../core/stream.js";
import { pointerEvents } from "../dom-event/pointer-events.js";
import type { MultiPointerSignal } from "./multi-pointer-signal.js";
import { multiPointerFromPointer } from "./recognizer-from-pointer.js";
import type { MultiPointerOptions } from "./types.js";

export function multiPointer(
  target: EventTarget,
  options: MultiPointerOptions = {},
): Stream<MultiPointerSignal> {
  const source = pointerEvents(target);
  return multiPointerFromPointer(options)(source);
}
