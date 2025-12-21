export type Unsubscribe = () => void;

export interface Observer<T> {
  next(value: T): void;
  error?(err: unknown): void;
  complete?(): void;
}

export interface Observable<T> {
  subscribe(observer: Observer<T> | ((value: T) => void)): Unsubscribe;
}

export type Operator<T, R> = (source: Observable<T>) => Observable<R>;

export function toObserver<T>(
  observerOrNext: Observer<T> | ((value: T) => void)
): Observer<T> {
  if (typeof observerOrNext === "function") {
    return { next: observerOrNext };
  }
  return observerOrNext;
}

export function createObservable<T>(
  subscribeFn: (observer: Observer<T>) => Unsubscribe | void
): Observable<T> {
  return {
    subscribe(observerOrNext) {
      const observer = toObserver(observerOrNext);
      const cleanup = subscribeFn(observer);
      return cleanup ?? (() => {});
    },
  };
}
