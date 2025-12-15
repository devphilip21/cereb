import type { Observable, Operator } from "../observable.js";
import { createObservable } from "../observable.js";

export function take<T>(count: number): Operator<T, T> {
  return (source) =>
    createObservable((observer) => {
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

export function takeWhile<T>(
  predicate: (value: T) => boolean
): Operator<T, T> {
  return (source) =>
    createObservable((observer) => {
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

export function takeUntil<T>(
  notifier: Observable<unknown>
): Operator<T, T> {
  return (source) =>
    createObservable((observer) => {
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
