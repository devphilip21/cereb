import { createStream, type Stream } from "../core/stream.js";

export function interval(ms: number): Stream<number> {
  return createStream((observer) => {
    let count = 0;
    const id = setInterval(() => {
      observer.next(count++);
    }, ms);

    return () => {
      clearInterval(id);
    };
  });
}
