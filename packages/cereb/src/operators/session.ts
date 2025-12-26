import type { SinglePointerSignal } from "../browser/single-pointer/single-pointer-signal.js";
import type { Signal } from "../core/signal.js";
import type { Operator } from "../core/stream.js";
import { createStream } from "../core/stream.js";

export interface SessionOptions<T extends Signal> {
  start: (signal: T) => boolean;
  end: (signal: T) => boolean;
}

/**
 * Filters signals to only emit during active sessions.
 * A session begins when the start predicate returns true and ends when the end predicate returns true.
 * Both start and end signals are included in the output.
 * Sessions can repeat: after an end, the next start begins a new session.
 */
export function session<T extends Signal>(options: SessionOptions<T>): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let active = false;

      return source.subscribe({
        next(value) {
          try {
            if (!active) {
              if (options.start(value)) {
                active = true;
                observer.next(value);
              }
            } else {
              observer.next(value);
              if (options.end(value)) {
                active = false;
              }
            }
          } catch (err) {
            observer.error?.(err);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    });
}

export function singlePointerSession(): Operator<SinglePointerSignal, SinglePointerSignal> {
  return session({
    start: (signal) => signal.value.phase === "start",
    end: (signal) => signal.value.phase === "end" || signal.value.phase === "cancel",
  });
}
