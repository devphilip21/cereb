import { createStream, type Stream } from "../../core/stream.js";
import { createDomEventSignal, type DomEventSignal } from "./dom-event-signal.js";

const TOUCH_EVENTS = ["touchstart", "touchmove", "touchend", "touchcancel"] as const;

export function touchEvents(
  target: EventTarget,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<TouchEvent>> {
  return createStream((observer) => {
    const handler = (event: Event) => {
      observer.next(createDomEventSignal(event as TouchEvent));
    };

    for (let i = 0; i < TOUCH_EVENTS.length; i++) {
      const eventName = TOUCH_EVENTS[i];
      target.addEventListener(eventName, handler, options);
    }

    return () => {
      for (let i = 0; i < TOUCH_EVENTS.length; i++) {
        const eventName = TOUCH_EVENTS[i];
        target.removeEventListener(eventName, handler, options);
      }
    };
  });
}
