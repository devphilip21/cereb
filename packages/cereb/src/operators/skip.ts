import type { Signal } from "../core/signal.js";
import type { Operator, Stream } from "../core/stream.js";
import { createStream } from "../core/stream.js";

export function skip<T extends Signal>(count: number): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let skipped = 0;

      return source.subscribe({
        next(value) {
          if (skipped < count) {
            skipped++;
          } else {
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    });
}

export function skipWhile<T extends Signal>(predicate: (value: T) => boolean): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let skipping = true;

      return source.subscribe({
        next(value) {
          if (skipping && !predicate(value)) {
            skipping = false;
          }
          if (!skipping) {
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    });
}

export function skipUntil<T extends Signal>(notifier: Stream<Signal>): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let skipping = true;

      const notifierUnsub = notifier.subscribe(() => {
        skipping = false;
        notifierUnsub();
      });

      const sourceUnsub = source.subscribe({
        next(value) {
          if (!skipping) {
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });

      return () => {
        notifierUnsub();
        sourceUnsub();
      };
    });
}
