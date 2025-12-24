import { createStream, type Stream } from "../core/stream.js";

export function empty<T = never>(): Stream<T> {
  return createStream((observer) => {
    observer.complete?.();
    return () => {};
  });
}
