import { createStream, type Stream } from "../../core/stream.js";
import { createDomEventSignal, type DomEventSignal } from "./dom-event-signal.js";

export function domEvent(
  target: EventTarget,
  eventName: string,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<Event>> {
  return createStream<DomEventSignal<Event>>((observer) => {
    const handler = (e: Event) => {
      observer.next(createDomEventSignal(e));
    };

    target.addEventListener(eventName, handler, options);

    return () => {
      target.removeEventListener(eventName, handler, options);
    };
  });
}
