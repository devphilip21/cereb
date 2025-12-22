import type { Operator } from "@gesturejs/stream";
import { createObservable } from "@gesturejs/stream";
import type { PanEvent } from "../event.js";
import type { VelocityExtension } from "../extensions.js";
import { calculateVelocity } from "../velocity.js";

/**
 * Augmentation operator that adds velocity calculation to pan events.
 *
 * Transforms PanEvent<T> to PanEvent<T & VelocityExtension>, adding
 * velocityX and velocityY properties to each event.
 *
 * @example
 * ```typescript
 * pipe(
 *   singlePointer(element),
 *   panGesture({ threshold: 10 }),
 *   withVelocity()
 * ).subscribe(event => {
 *   console.log(event.deltaX, event.velocityX);
 * });
 * ```
 */
export function withVelocity<T extends {}>(): Operator<
  PanEvent<T>,
  PanEvent<T & VelocityExtension>
> {
  return (source) =>
    createObservable((observer) => {
      let prevX = 0;
      let prevY = 0;
      let prevTimestamp = 0;
      let initialized = false;

      const unsub = source.subscribe({
        next(event) {
          if (event.phase === "start") {
            prevX = event.x;
            prevY = event.y;
            prevTimestamp = event.timestamp;
            initialized = true;
          }

          const { velocityX, velocityY } = initialized
            ? calculateVelocity(event.x, event.y, event.timestamp, prevX, prevY, prevTimestamp)
            : { velocityX: 0, velocityY: 0 };

          prevX = event.x;
          prevY = event.y;
          prevTimestamp = event.timestamp;

          if (event.phase === "end" || event.phase === "cancel") {
            initialized = false;
          }

          const extended = event as PanEvent<T & VelocityExtension>;
          extended.velocityX = velocityX;
          extended.velocityY = velocityY;

          observer.next(extended);
        },
        error: observer.error?.bind(observer),
        complete: observer.complete?.bind(observer),
      });

      return () => {
        initialized = false;
        unsub();
      };
    });
}
