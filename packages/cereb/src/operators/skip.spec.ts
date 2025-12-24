import { describe, expect, it } from "vitest";
import { createSubject } from "../internal/subject.js";
import { createTestSignal, fromArray, type TestSignal } from "../internal/test-utils.js";
import { pipe } from "../ochestrations/pipe.js";
import { skip, skipUntil, skipWhile } from "./skip.js";

describe("skip", () => {
  it("should skip first N values", () => {
    const values: number[] = [];

    pipe(fromArray([1, 2, 3, 4, 5]), skip(2)).subscribe((v) => values.push(v.value));

    expect(values).toEqual([3, 4, 5]);
  });
});

describe("skipWhile", () => {
  it("should skip values while predicate is true", () => {
    const values: number[] = [];

    pipe(
      fromArray([1, 2, 3, 4, 5]),
      skipWhile((x: TestSignal<number>) => x.value < 3),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual([3, 4, 5]);
  });

  it("should not re-evaluate predicate after it returns false", () => {
    const values: number[] = [];

    pipe(
      fromArray([1, 2, 5, 1, 2]),
      skipWhile((x: TestSignal<number>) => x.value < 3),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual([5, 1, 2]);
  });
});

describe("skipUntil", () => {
  it("should skip values until notifier emits", () => {
    const source = createSubject<TestSignal<number>>();
    const notifier = createSubject<TestSignal<void>>();
    const values: number[] = [];

    pipe(source, skipUntil(notifier)).subscribe((v) => values.push(v.value));

    source.next(createTestSignal(1));
    source.next(createTestSignal(2));
    notifier.next(createTestSignal(undefined));
    source.next(createTestSignal(3));
    source.next(createTestSignal(4));

    expect(values).toEqual([3, 4]);
  });
});
