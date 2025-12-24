import { createStream, type Stream } from "../../core/stream.js";
import { createDomEventSignal, type DomEventSignal } from "./dom-event-signal.js";

const MOUSE_EVENTS = ["mousedown", "mousemove", "mouseup"] as const;

export function mouseEvents(
  target: EventTarget,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<MouseEvent>> {
  return createStream<DomEventSignal<MouseEvent>>((observer) => {
    const handler = (event: Event) => {
      observer.next(createDomEventSignal(event as MouseEvent));
    };

    for (let i = 0; i < MOUSE_EVENTS.length; i++) {
      const eventName = MOUSE_EVENTS[i];
      target.addEventListener(eventName, handler, options);
    }

    return () => {
      for (let i = 0; i < MOUSE_EVENTS.length; i++) {
        const eventName = MOUSE_EVENTS[i];
        target.removeEventListener(eventName, handler, options);
      }
    };
  });
}
