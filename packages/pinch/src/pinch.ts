import type { MultiPointerSignal, Operator, Stream } from "cereb";
import { createStream, multiPointer, pipe } from "cereb";
import { multiPointerSession } from "cereb/operators";
import type { PinchSignal } from "./pinch-signal.js";
import type { PinchOptions } from "./pinch-types.js";
import { createPinchRecognizer } from "./recognizer.js";

/**
 * Operator that transforms MultiPointer signals into PinchSignal events.
 *
 * Use this when composing with other operators or using a custom pointer source.
 *
 * @example
 * ```typescript
 * pipe(
 *   multiPointer(element, { maxPointers: 2 }),
 *   multiPointerSession(2),
 *   pinchRecognizer({ threshold: { ratio: 0.05 } }),
 *   zoom({ minScale: 0.5, maxScale: 3.0 })
 * ).subscribe(pinch => console.log(pinch.value.distance, pinch.value.scale));
 * ```
 */
export function pinchRecognizer(
  options: PinchOptions = {},
): Operator<MultiPointerSignal, PinchSignal> {
  return (source) =>
    createStream((observer) => {
      const recognizer = createPinchRecognizer(options);

      const unsub = source.subscribe({
        next(signal) {
          const event = recognizer.process(signal);
          if (event) {
            observer.next(event);
          }
        },
        error: observer.error?.bind(observer),
        complete() {
          observer.complete?.();
        },
      });

      return () => {
        recognizer.dispose();
        unsub();
      };
    });
}

/**
 * Creates a pinch gesture stream from an element.
 *
 * This is a convenience function that combines multiPointer, multiPointerSession,
 * and pinch recognition.
 *
 * @example
 * ```typescript
 * pipe(
 *   pinch(element, { threshold: { ratio: 0.05 } }),
 *   zoom({ minScale: 0.5, maxScale: 3.0 })
 * ).subscribe(event => console.log(event.value.distance, event.value.scale));
 * ```
 */
export function pinch(target: EventTarget, options: PinchOptions = {}): Stream<PinchSignal> {
  return pipe(
    multiPointer(target, { maxPointers: 2 }),
    multiPointerSession(2),
    pinchRecognizer(options),
  );
}
