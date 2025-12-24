import type { Signal } from "../core/signal.js";
import type { Operator, Stream } from "../core/stream.js";
import { createStream } from "../core/stream.js";

export function buffer<T extends Signal>(count: number): Operator<T, Signal<"buffer", T[]>> {
  return (source) =>
    createStream((observer) => {
      let bufferArr: T[] = [];

      return source.subscribe({
        next(value) {
          bufferArr.push(value);
          if (bufferArr.length >= count) {
            observer.next({
              kind: "buffer",
              value: bufferArr,
              deviceId: "",
              createdAt: Date.now(),
            });
            bufferArr = [];
          }
        },
        error: observer.error?.bind(observer),
        complete() {
          if (bufferArr.length > 0) {
            observer.next({
              kind: "buffer",
              value: bufferArr,
              deviceId: "",
              createdAt: Date.now(),
            });
          }
          observer.complete?.();
        },
      });
    });
}

export function bufferTime<T extends Signal>(ms: number): Operator<T, Signal<"buffer", T[]>> {
  return (source) =>
    createStream((observer) => {
      let bufferArr: T[] = [];

      const intervalId = setInterval(() => {
        if (bufferArr.length > 0) {
          observer.next({
            kind: "buffer",
            value: bufferArr,
            deviceId: "",
            createdAt: Date.now(),
          });
          bufferArr = [];
        }
      }, ms);

      const unsub = source.subscribe({
        next(value) {
          bufferArr.push(value);
        },
        error: observer.error?.bind(observer),
        complete() {
          clearInterval(intervalId);
          if (bufferArr.length > 0) {
            observer.next({
              kind: "buffer",
              value: bufferArr,
              deviceId: "",
              createdAt: Date.now(),
            });
          }
          observer.complete?.();
        },
      });

      return () => {
        clearInterval(intervalId);
        unsub();
      };
    });
}

export function bufferWhen<T extends Signal>(
  notifier: Stream<Signal>,
): Operator<T, Signal<"buffer", T[]>> {
  return (source) =>
    createStream((observer) => {
      let bufferArr: T[] = [];

      const notifierUnsub = notifier.subscribe(() => {
        if (bufferArr.length > 0) {
          observer.next({
            kind: "buffer",
            value: bufferArr,
            deviceId: "",
            createdAt: Date.now(),
          });
          bufferArr = [];
        }
      });

      const sourceUnsub = source.subscribe({
        next(value) {
          bufferArr.push(value);
        },
        error: observer.error?.bind(observer),
        complete() {
          notifierUnsub();
          if (bufferArr.length > 0) {
            observer.next({
              kind: "buffer",
              value: bufferArr,
              deviceId: "",
              createdAt: Date.now(),
            });
          }
          observer.complete?.();
        },
      });

      return () => {
        notifierUnsub();
        sourceUnsub();
      };
    });
}
