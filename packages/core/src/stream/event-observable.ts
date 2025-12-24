import type { Observable, Observer, Unsubscribe } from "./observable.js";
import { toObserver } from "./observable.js";

/**
 * EventObservable extends Observable with event flow control capabilities.
 * When blocked, events are silently dropped for ALL subscribers.
 * This enables coordination between gesture handlers (e.g., blocking scroll
 * events during a pan gesture).
 */
export interface EventObservable<T> extends Observable<T> {
  /** Block event propagation to subscribers. Events are dropped, not queued. */
  block(): void;

  /** Unblock event propagation, resuming normal event flow. */
  unblock(): void;

  /** Returns true if the stream is currently blocked. */
  readonly isBlocked: boolean;
}

/**
 * Creates an EventObservable from a subscribe function.
 * The returned observable can be blocked/unblocked to control event flow.
 * When blocked, events are silently dropped for all subscribers.
 */
export function createEventObservable<T>(
  subscribeFn: (observer: Observer<T>) => Unsubscribe | void,
): EventObservable<T> {
  let blocked = false;

  return {
    get isBlocked() {
      return blocked;
    },

    block() {
      blocked = true;
    },

    unblock() {
      blocked = false;
    },

    subscribe(observerOrNext) {
      const observer = toObserver(observerOrNext);

      const wrappedObserver: Observer<T> = {
        next(value) {
          if (!blocked) {
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      };

      const cleanup = subscribeFn(wrappedObserver);
      return cleanup ?? (() => {});
    },
  };
}

/**
 * Converts an existing Observable to an EventObservable with blocking capabilities.
 * Useful for wrapping merged or transformed streams.
 */
export function asBlockable<T>(source: Observable<T>): EventObservable<T> {
  let blocked = false;

  return {
    get isBlocked() {
      return blocked;
    },

    block() {
      blocked = true;
    },

    unblock() {
      blocked = false;
    },

    subscribe(observerOrNext) {
      const observer = toObserver(observerOrNext);

      return source.subscribe({
        next(value) {
          if (!blocked) {
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    },
  };
}
