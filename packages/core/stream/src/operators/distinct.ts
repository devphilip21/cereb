import type { Operator } from "../observable.js";
import { createObservable } from "../observable.js";

export function distinctUntilChanged<T>(
  compare?: (prev: T, curr: T) => boolean
): Operator<T, T> {
  const isEqual = compare ?? ((a: T, b: T) => a === b);

  return (source) =>
    createObservable((observer) => {
      let hasLast = false;
      let lastValue: T;

      return source.subscribe({
        next(value) {
          if (!hasLast || !isEqual(lastValue, value)) {
            hasLast = true;
            lastValue = value;
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    });
}

export function distinctUntilKeyChanged<T, K>(
  keySelector: (value: T) => K,
  compare?: (prev: K, curr: K) => boolean
): Operator<T, T> {
  const isEqual = compare ?? ((a: K, b: K) => a === b);

  return (source) =>
    createObservable((observer) => {
      let hasLast = false;
      let lastKey: K;

      return source.subscribe({
        next(value) {
          const key = keySelector(value);
          if (!hasLast || !isEqual(lastKey, key)) {
            hasLast = true;
            lastKey = key;
            observer.next(value);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    });
}
