import { createStream, type Stream } from "../../core/stream.js";
import { createDomEventSignal, type DomEventSignal } from "./dom-event-signal.js";

const POINTER_EVENTS = ["pointerdown", "pointermove", "pointerup", "pointercancel"] as const;

export function pointerEvents(
  target: EventTarget,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<PointerEvent>> {
  return createStream<DomEventSignal<PointerEvent>>((observer) => {
    const handler = (event: Event) => {
      observer.next(createDomEventSignal(event as PointerEvent));
    };

    for (let i = 0; i < POINTER_EVENTS.length; i++) {
      const eventName = POINTER_EVENTS[i];
      target.addEventListener(eventName, handler, options);
    }

    return () => {
      for (let i = 0; i < POINTER_EVENTS.length; i++) {
        const eventName = POINTER_EVENTS[i];
        target.removeEventListener(eventName, handler, options);
      }
    };
  });
}
