import type { Operator } from "../../core/stream.js";
import { createStream } from "../../core/stream.js";
import type { DomEventSignal } from "../dom-event/dom-event-signal.js";
import {
  createSinglePointerEmitter,
  type SinglePointerEmitter,
  type SinglePointerEmitterOptions,
} from "./emitter.js";
import type { SinglePointerSignal } from "./single-pointer-signal.js";
import type { SinglePointerPhase } from "./types.js";

export function createTouchEmitter(
  options: SinglePointerEmitterOptions = {},
): SinglePointerEmitter<DomEventSignal<TouchEvent>> {
  function processer(event: DomEventSignal<TouchEvent>, signal: SinglePointerSignal): void {
    const e = event.value;
    const touch = e.touches[0] ?? e.changedTouches[0];
    if (!touch) {
      return;
    }

    let phase: SinglePointerPhase;
    switch (e.type) {
      case "touchstart":
        phase = "start";
        break;
      case "touchend":
        phase = "end";
        break;
      case "touchcancel":
        phase = "cancel";
        break;
      default:
        phase = "move";
    }

    signal.value.phase = phase;
    signal.value.x = touch.clientX;
    signal.value.y = touch.clientY;
    signal.value.pageX = touch.pageX;
    signal.value.pageY = touch.pageY;
    signal.value.pointerType = "touch";
    signal.value.button = "none";
    signal.value.pressure = touch.force || 0.5;
  }

  return createSinglePointerEmitter(processer, options);
}

export function touchToSinglePointer(
  options: SinglePointerEmitterOptions = {},
): Operator<DomEventSignal<TouchEvent>, SinglePointerSignal> {
  return (source) =>
    createStream((observer) => {
      const emitter = createTouchEmitter(options);

      const unsub = source.subscribe({
        next(event) {
          const pointer = emitter.process(event);
          if (pointer) {
            observer.next(pointer);
          }
        },
        error(err) {
          observer.error?.(err);
        },
        complete() {
          observer.complete?.();
        },
      });

      return () => {
        unsub();
        emitter.dispose();
      };
    });
}
