import type { ExtendSignalValue, SignalWith } from "../core/signal.js";
import type { Operator } from "../core/stream.js";
import { createStream } from "../core/stream.js";

export interface OffsetOptions {
  target: Element;
  manual?: boolean;
}

export interface PointerValue {
  x: number;
  y: number;
}

export interface OffsetValue {
  offsetX: number;
  offsetY: number;
}

export type OffsetOperatorResult<T extends SignalWith<PointerValue>> = ExtendSignalValue<
  T,
  OffsetValue
>;

export interface OffsetOperator<T extends SignalWith<PointerValue>>
  extends Operator<T, ExtendSignalValue<T, OffsetValue>> {
  recalculate(): void;
}

/**
 * Creates an operator that adds element-relative offset coordinates to pointer signals.
 * Uses getBoundingClientRect() to calculate offsetX and offsetY relative to the target element.
 */
export function offset<T extends SignalWith<PointerValue>>(
  options: OffsetOptions,
): OffsetOperator<T> {
  const { target, manual = false } = options;
  if (!target) {
    throw new Error("offset operator requires a valid target element");
  }

  let cachedRect: DOMRect | null = null;

  function getRect(): DOMRect {
    if (manual && cachedRect) {
      return cachedRect;
    }
    cachedRect = target.getBoundingClientRect();
    return cachedRect;
  }

  function recalculate(): void {
    cachedRect = target.getBoundingClientRect();
  }

  type OutputSignal = ExtendSignalValue<T, OffsetValue>;

  const operator: OffsetOperator<T> = (source) =>
    createStream<OutputSignal>((observer) => {
      const unsub = source.subscribe({
        next(signal) {
          try {
            const rect = getRect();
            const value = signal.value as PointerValue & OffsetValue;

            value.offsetX = value.x - rect.left;
            value.offsetY = value.y - rect.top;

            observer.next(signal as unknown as OutputSignal);
          } catch (err) {
            observer.error?.(err);
          }
        },
        error: observer.error?.bind(observer),
        complete() {
          observer.complete?.();
        },
      });

      return () => {
        unsub();
      };
    });
  operator.recalculate = recalculate;

  return operator;
}
