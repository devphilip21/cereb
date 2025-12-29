import { createStream, type Stream } from "../../core/stream.js";
import { createDomEventSignal, type DomEventSignal } from "./dom-event-signal.js";

type AnyEventMap = Record<string, Event>;

/**
 * Strongly-typed event target for custom event maps.
 * Useful for non-DOM EventTargets that still have named events.
 */
export type TypedEventTarget<M extends AnyEventMap> = EventTarget & {
  addEventListener<K extends keyof M>(
    type: K,
    listener: (event: M[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof M>(
    type: K,
    listener: (event: M[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
};

export function domEvent<K extends keyof WindowEventMap>(
  target: Window,
  eventName: K,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<WindowEventMap[K]>>;
export function domEvent<K extends keyof DocumentEventMap>(
  target: Document,
  eventName: K,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<DocumentEventMap[K]>>;
export function domEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  eventName: K,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<HTMLElementEventMap[K]>>;
export function domEvent<K extends keyof SVGElementEventMap>(
  target: SVGElement,
  eventName: K,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<SVGElementEventMap[K]>>;
export function domEvent<M extends AnyEventMap, K extends keyof M>(
  target: TypedEventTarget<M>,
  eventName: K,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<M[K]>>;
export function domEvent<E extends Event = Event>(
  target: EventTarget,
  eventName: string,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<E>>;
export function domEvent<E extends Event = Event>(
  target: EventTarget,
  eventName: string,
  options?: AddEventListenerOptions,
): Stream<DomEventSignal<E>> {
  return createStream<DomEventSignal<E>>((observer) => {
    // NOTE: EventTarget's base signature expects an EventListener (Event),
    // so we accept Event and cast to the inferred event type for the signal.
    const handler: EventListener = (event) => {
      observer.next(createDomEventSignal(event as E));
    };

    target.addEventListener(eventName, handler, options);

    return () => {
      target.removeEventListener(eventName, handler, options);
    };
  });
}
