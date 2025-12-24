import { describe, expect, it } from "vitest";
import { fromArray, type TestSignal } from "../internal/test-utils.js";
import { filter, map } from "../operators/index.js";
import { pipe } from "./pipe.js";

describe("pipe", () => {
  it("should apply operators in order", () => {
    const values: number[] = [];

    pipe(
      fromArray([1, 2, 3, 4, 5]),
      filter((x: TestSignal<number>) => x.value % 2 === 1),
      map((x: TestSignal<number>) => ({ ...x, value: x.value * 10 })),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual([10, 30, 50]);
  });

  it("should support type transformation", () => {
    const values: string[] = [];

    pipe(
      fromArray([1, 2, 3]),
      map((x: TestSignal<number>) => ({ ...x, value: String(x.value) }) as TestSignal<string>),
      map((x: TestSignal<string>) => ({ ...x, value: `${x.value}!` })),
    ).subscribe((v) => values.push(v.value));

    expect(values).toEqual(["1!", "2!", "3!"]);
  });
});
