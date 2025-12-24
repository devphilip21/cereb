import { createStream, type Stream } from "../core/stream.js";

export function never<T = never>(): Stream<T> {
  return createStream(() => {
    return () => {};
  });
}
