import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSubject } from "../internal/subject.js";
import { createTestSignal, fromArray, type TestSignal } from "../internal/test-utils.js";
import { pipe } from "../ochestrations/index.js";
import { buffer, bufferTime, bufferWhen } from "./buffer.js";

describe("buffer", () => {
  it("should buffer values by count", () => {
    const values: number[][] = [];

    pipe(fromArray([1, 2, 3, 4, 5]), buffer(2)).subscribe((v) =>
      values.push(v.value.map((s) => s.value)),
    );

    expect(values).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("bufferTime", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("should buffer values by time", () => {
    const source = createSubject<TestSignal<number>>();
    const values: number[][] = [];

    pipe(source, bufferTime(100)).subscribe((v) => values.push(v.value.map((s) => s.value)));

    source.next(createTestSignal(1));
    source.next(createTestSignal(2));
    vi.advanceTimersByTime(100);
    source.next(createTestSignal(3));
    vi.advanceTimersByTime(100);

    expect(values).toEqual([[1, 2], [3]]);
  });
});

describe("bufferWhen", () => {
  it("should buffer until notifier emits", () => {
    const source = createSubject<TestSignal<number>>();
    const notifier = createSubject<TestSignal<void>>();
    const values: number[][] = [];

    pipe(source, bufferWhen(notifier)).subscribe((v) => values.push(v.value.map((s) => s.value)));

    source.next(createTestSignal(1));
    source.next(createTestSignal(2));
    notifier.next(createTestSignal(undefined));
    source.next(createTestSignal(3));
    notifier.next(createTestSignal(undefined));

    expect(values).toEqual([[1, 2], [3]]);
  });
});
