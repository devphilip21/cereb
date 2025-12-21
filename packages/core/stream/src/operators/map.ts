import type { Operator } from "../observable.js";
import { createObservable } from "../observable.js";

export function map<T, R>(
  transform: (value: T) => R
): Operator<T, R> {
  return (source) =>
    createObservable((observer) => {
      return source.subscribe({
        next(value) {
          try {
            observer.next(transform(value));
          } catch (err) {
            observer.error?.(err);
          }
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });
    });
}
