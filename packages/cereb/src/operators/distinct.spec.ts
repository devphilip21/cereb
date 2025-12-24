import { describe, expect, it } from "vitest";
import { fromArray, type TestSignal } from "../internal/test-utils.js";
import { pipe } from "../ochestrations/index.js";
import { distinctUntilChanged, distinctUntilKeyChanged } from "./distinct.js";

describe("distinctUntilChanged", () => {
  it("should emit only distinct consecutive values", () => {
    const values: number[] = [];

    pipe(fromArray([1, 1, 2, 2, 2, 3, 1, 1]), distinctUntilChanged()).subscribe((v) =>
      values.push(v.value),
    );

    expect(values).toEqual([1, 2, 3, 1]);
  });

  it("should use custom comparator", () => {
    const values: { x: number; y: number }[] = [];

    pipe(
      fromArray([
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
      ]),
      distinctUntilChanged(
        (a: TestSignal<{ x: number; y: number }>, b: TestSignal<{ x: number; y: number }>) =>
          a.value.x === b.value.x,
      ),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]);
  });
});

describe("distinctUntilKeyChanged", () => {
  it("should emit only when key value changes", () => {
    const values: { id: number; name: string }[] = [];

    pipe(
      fromArray([
        { id: 1, name: "Alice" },
        { id: 1, name: "Bob" },
        { id: 2, name: "Charlie" },
      ]),
      distinctUntilKeyChanged((x: TestSignal<{ id: number; name: string }>) => x.value.id),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual([
      { id: 1, name: "Alice" },
      { id: 2, name: "Charlie" },
    ]);
  });
});
