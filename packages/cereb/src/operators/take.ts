import type { Signal } from "../core/signal.js";
import type { Operator, Stream } from "../core/stream.js";
import { createStream } from "../core/stream.js";

/**
 * Operators for ending a subscription based on count, a predicate, or a notifier.
 *
 * This is intentionally about **subscription lifecycle** ("when should this pipeline stop?"),
 * not about destroying the underlying event source (which may be shared by other subscribers).
 *
 * Common event/gesture patterns:
 * - One-shot trigger: `take(1)`
 * - While a condition holds: `takeWhile(predicate)`
 * - Until an explicit end signal: `takeUntil(end$)` (e.g. move until up/cancel)
 */
export function take<T extends Signal>(count: number): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let taken = 0;
      let unsub: (() => void) | undefined;

      unsub = source.subscribe({
        next(value) {
          if (taken < count) {
            taken++;
            observer.next(value);
            if (taken >= count) {
              observer.complete?.();
              unsub?.();
            }
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });

      return () => unsub?.();
    });
}

/**
 * Emits only the first `count` values, then completes and unsubscribes.
 * `take(1)` is especially useful for one-shot triggers.
 */
export function takeWhile<T extends Signal>(predicate: (value: T) => boolean): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let unsub: (() => void) | undefined;

      unsub = source.subscribe({
        next(value) {
          if (predicate(value)) {
            observer.next(value);
          } else {
            observer.complete?.();
            unsub?.();
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });

      return () => unsub?.();
    });
}

/**
 * Emits values while `predicate(value)` is true, then completes and unsubscribes.
 */
export function takeUntil<T extends Signal>(notifier: Stream<Signal>): Operator<T, T> {
  return (source) =>
    createStream((observer) => {
      let completed = false;

      const notifierUnsub = notifier.subscribe(() => {
        if (!completed) {
          completed = true;
          observer.complete?.();
          cleanup();
        }
      });

      const sourceUnsub = source.subscribe({
        next(value) {
          if (!completed) {
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete() {
          if (!completed) {
            completed = true;
            observer.complete?.();
          }
        },
      });

      const cleanup = () => {
        notifierUnsub();
        sourceUnsub();
      };

      return cleanup;
    });
}

/**
 * Completes the source subscription when `notifier` emits, and unsubscribes from both.
 * This is the go-to shape for "observe from start until end" event flows.
 */
