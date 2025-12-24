import type { Signal } from "../core/signal.js";
import type { Operator } from "../core/stream.js";
import { createStream } from "../core/stream.js";

/**
 * Emits values only when they differ from the previous emitted value.
 *
 * In event/gesture pipelines, this is useful when you only want to react to
 * meaningful changes (e.g. pointer coordinates changed, delta changed, a state transition happened).
 *
 * The default comparison is based on Signal's value property using `===`.
 * For objects/arrays, provide `compare` to avoid treating freshly-created but equivalent values as "changed".
 *
 * @example
 * ```typescript
 * import { eventSource } from "../../source/event-source-factory.js";
 * import { pipe } from "../pipe.js";
 * import { map } from "./map.js";
 *
 * // Only emit when the pointer position actually changes
 * pipe(
 *   eventSource<PointerEvent>(element, "pointermove"),
 *   map((e) => ({ x: e.clientX, y: e.clientY })),
 *   distinctUntilChanged((a, b) => a.value.x === b.value.x && a.value.y === b.value.y),
 * ).subscribe(({ x, y }) => {
 *   // Called only when (x, y) changes
 * });
 * ```
 */
export function distinctUntilChanged<T extends Signal>(
  compare?: (prev: T, curr: T) => boolean,
): Operator<T, T> {
  const isEqual = compare ?? ((a: T, b: T) => a.value === b.value);

  return (source) =>
    createStream((observer) => {
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

/**
 * Like `distinctUntilChanged`, but compares a derived key instead of the entire value.
 *
 * This is convenient for gesture events when reacting to state transitions,
 * such as changes in `phase`.
 *
 * @example
 * ```typescript
 * import { pipe } from "../pipe.js";
 *
 * // Emit only when the gesture phase changes (start/change/end/cancel)
 * pipe(
 *   pan(element),
 *   distinctUntilKeyChanged((e) => e.value.phase),
 * ).subscribe((e) => {
 *   // Consecutive identical phases are skipped; only transitions arrive here
 * });
 * ```
 */
export function distinctUntilKeyChanged<T extends Signal, K>(
  keySelector: (value: T) => K,
  compare?: (prev: K, curr: K) => boolean,
): Operator<T, T> {
  const isEqual = compare ?? ((a: K, b: K) => a === b);

  return (source) =>
    createStream((observer) => {
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
