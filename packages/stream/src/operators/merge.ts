import type { Observable, Operator } from "../observable.js";
import { createObservable } from "../observable.js";

export function mergeWith<T, R>(
  other: Observable<R>
): Operator<T, T | R> {
  return (source) =>
    createObservable((observer) => {
      let completedCount = 0;

      const checkComplete = () => {
        completedCount++;
        if (completedCount === 2) {
          observer.complete?.();
        }
      };

      const unsub1 = source.subscribe({
        next: (value) => observer.next(value),
        error: observer.error?.bind(observer),
        complete: checkComplete,
      });

      const unsub2 = other.subscribe({
        next: (value) => observer.next(value),
        error: observer.error?.bind(observer),
        complete: checkComplete,
      });

      return () => {
        unsub1();
        unsub2();
      };
    });
}

export function merge<T>(
  ...sources: Observable<T>[]
): Observable<T> {
  return createObservable((observer) => {
    let completedCount = 0;

    const unsubs = sources.map((source) =>
      source.subscribe({
        next: (value) => observer.next(value),
        error: observer.error?.bind(observer),
        complete: () => {
          completedCount++;
          if (completedCount === sources.length) {
            observer.complete?.();
          }
        },
      })
    );

    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  });
}
