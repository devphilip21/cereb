import { describe, expect, it, vi } from "vitest";
import { createSubject } from "../internal/subject.js";
import { createTestSignal, fromArray, type TestSignal } from "../internal/test-utils.js";
import { pipe } from "../ochestrations/pipe.js";
import { take, takeUntil, takeWhile } from "./take.js";

describe("take", () => {
  it("should take first N values and complete", () => {
    const values: number[] = [];
    const complete = vi.fn();

    pipe(fromArray([1, 2, 3, 4, 5]), take(3)).subscribe({
      next: (v) => values.push(v.value),
      complete,
    });

    expect(values).toEqual([1, 2, 3]);
    expect(complete).toHaveBeenCalled();
  });
});

describe("takeWhile", () => {
  it("should take values while predicate is true", () => {
    const values: number[] = [];

    pipe(
      fromArray([1, 2, 3, 4, 5]),
      takeWhile((x: TestSignal<number>) => x.value < 4),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual([1, 2, 3]);
  });
});

describe("takeUntil", () => {
  it("should take values until notifier emits", () => {
    const source = createSubject<TestSignal<number>>();
    const notifier = createSubject<TestSignal<void>>();
    const values: number[] = [];

    pipe(source, takeUntil(notifier)).subscribe((v) => values.push(v.value));

    source.next(createTestSignal(1));
    source.next(createTestSignal(2));
    notifier.next(createTestSignal(undefined));
    source.next(createTestSignal(3));

    expect(values).toEqual([1, 2]);
  });
});
