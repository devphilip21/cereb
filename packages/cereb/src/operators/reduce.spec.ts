import { describe, expect, it, vi } from "vitest";
import type { Signal } from "../core/signal.js";
import { createStream, type Stream } from "../core/stream.js";
import { pipe } from "../ochestrations/pipe.js";
import { reduce } from "./reduce.js";

interface InputValue {
  delta: number;
}

interface TestInputSignal extends Signal<"test-input", InputValue> {
  kind: "test-input";
  value: InputValue;
}

function createInputSignal(delta: number): TestInputSignal {
  return {
    kind: "test-input",
    value: { delta },
    deviceId: "test-device",
    createdAt: Date.now(),
  };
}

function fromDeltas(deltas: number[]): Stream<TestInputSignal> {
  return createStream((observer) => {
    for (const delta of deltas) {
      observer.next(createInputSignal(delta));
    }
    observer.complete?.();
    return () => {};
  });
}

interface AccumulatedValue {
  sum: number;
  count: number;
}

describe("reduce", () => {
  it("should accumulate values over time", () => {
    const results: AccumulatedValue[] = [];

    pipe(
      fromDeltas([1, 2, 3, 4]),
      reduce<TestInputSignal, AccumulatedValue>(
        (acc, signal) => ({
          sum: acc.sum + signal.value.delta,
          count: acc.count + 1,
        }),
        { sum: 0, count: 0 },
      ),
    ).subscribe((signal) => {
      results.push({ sum: signal.value.sum, count: signal.value.count });
    });

    expect(results).toEqual([
      { sum: 1, count: 1 },
      { sum: 3, count: 2 },
      { sum: 6, count: 3 },
      { sum: 10, count: 4 },
    ]);
  });

  it("should use seed as initial accumulator", () => {
    const values: number[] = [];

    pipe(
      fromDeltas([1, 2]),
      reduce<TestInputSignal, { sum: number }>(
        (acc, signal) => ({ sum: acc.sum + signal.value.delta }),
        { sum: 100 },
      ),
    ).subscribe((signal) => values.push(signal.value.sum));

    expect(values).toEqual([101, 103]);
  });

  it("should preserve original signal kind", () => {
    const kinds: string[] = [];

    pipe(
      fromDeltas([1, 2, 3]),
      reduce<TestInputSignal, { sum: number }>(
        (acc, signal) => ({ sum: acc.sum + signal.value.delta }),
        { sum: 0 },
      ),
    ).subscribe((signal) => kinds.push(signal.kind));

    expect(kinds).toEqual(["test-input", "test-input", "test-input"]);
  });

  it("should preserve original signal deviceId", () => {
    const deviceIds: string[] = [];

    pipe(
      fromDeltas([1, 2]),
      reduce<TestInputSignal, { sum: number }>(
        (acc, signal) => ({ sum: acc.sum + signal.value.delta }),
        { sum: 0 },
      ),
    ).subscribe((signal) => deviceIds.push(signal.deviceId));

    expect(deviceIds).toEqual(["test-device", "test-device"]);
  });

  it("should preserve original signal createdAt", () => {
    const startTime = Date.now();

    pipe(
      fromDeltas([1, 2]),
      reduce<TestInputSignal, { sum: number }>(
        (acc, signal) => ({ sum: acc.sum + signal.value.delta }),
        { sum: 0 },
      ),
    ).subscribe((signal) => {
      expect(signal.createdAt).toBeGreaterThanOrEqual(startTime);
    });
  });

  it("should extend value with accumulated properties while preserving original", () => {
    pipe(
      fromDeltas([5]),
      reduce<TestInputSignal, { doubled: number }>(
        (_acc, signal) => ({ doubled: signal.value.delta * 2 }),
        { doubled: 0 },
      ),
    ).subscribe((signal) => {
      // Original value preserved
      expect(signal.value.delta).toBe(5);
      // Accumulated value extended
      expect(signal.value.doubled).toBe(10);
    });
  });

  it("should catch errors in reducer function", () => {
    const error = new Error("reducer error");
    const errorFn = vi.fn();

    pipe(
      fromDeltas([1]),
      reduce<TestInputSignal, { sum: number }>(
        () => {
          throw error;
        },
        { sum: 0 },
      ),
    ).subscribe({ next: vi.fn(), error: errorFn });

    expect(errorFn).toHaveBeenCalledWith(error);
  });

  it("should emit each intermediate result", () => {
    const values: number[] = [];

    pipe(
      fromDeltas([1, 2, 3]),
      reduce<TestInputSignal, { total: number }>(
        (acc, signal) => ({ total: acc.total + signal.value.delta }),
        { total: 0 },
      ),
    ).subscribe((signal) => values.push(signal.value.total));

    expect(values).toEqual([1, 3, 6]);
  });

  it("should have access to full signal in reducer", () => {
    const receivedSignals: TestInputSignal[] = [];

    pipe(
      fromDeltas([42]),
      reduce<TestInputSignal, { seen: boolean }>(
        (_acc, signal) => {
          receivedSignals.push(signal);
          return { seen: true };
        },
        { seen: false },
      ),
    ).subscribe(() => {});

    expect(receivedSignals).toHaveLength(1);
    expect(receivedSignals[0].kind).toBe("test-input");
    expect(receivedSignals[0].value.delta).toBe(42);
    expect(receivedSignals[0].deviceId).toBe("test-device");
  });
});
