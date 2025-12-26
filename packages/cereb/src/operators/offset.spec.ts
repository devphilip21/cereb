import { describe, expect, it, vi } from "vitest";
import type { SinglePointerSignal } from "../browser/single-pointer/single-pointer-signal.js";
import { createSinglePointerSignal } from "../browser/single-pointer/single-pointer-signal.js";
import { createStream } from "../core/stream.js";
import { pipe } from "../ochestrations/pipe.js";
import { type OffsetOperatorResult, offset } from "./offset.js";

type OffsetPointerSignal = OffsetOperatorResult<SinglePointerSignal>;

function createMockPointerSignal(x: number, y: number): SinglePointerSignal {
  return createSinglePointerSignal({
    id: "mouse-1",
    phase: "move",
    x,
    y,
    pageX: x,
    pageY: y,
    pointerType: "mouse",
    button: "none",
    pressure: 0.5,
  });
}

function createMockElement(rect: Partial<DOMRect> = {}): {
  element: Element;
  getBoundingClientRect: ReturnType<typeof vi.fn>;
} {
  const getBoundingClientRect = vi.fn(() => ({
    top: rect.top ?? 100,
    left: rect.left ?? 50,
    right: rect.right ?? 250,
    bottom: rect.bottom ?? 300,
    width: rect.width ?? 200,
    height: rect.height ?? 200,
    x: rect.x ?? 50,
    y: rect.y ?? 100,
    toJSON: () => ({}),
  }));
  return {
    element: { getBoundingClientRect } as unknown as Element,
    getBoundingClientRect,
  };
}

describe("offset operator", () => {
  it("should calculate offsetX and offsetY relative to target element", () => {
    const { element } = createMockElement({ top: 100, left: 50 });
    const op = offset<SinglePointerSignal>({ target: element });

    const values: Array<{ offsetX: number; offsetY: number }> = [];

    const source = createStream<SinglePointerSignal>((observer) => {
      observer.next(createMockPointerSignal(150, 200));
      return () => {};
    });

    pipe(source, op).subscribe((v: OffsetPointerSignal) => {
      values.push({ offsetX: v.value.offsetX, offsetY: v.value.offsetY });
    });

    expect(values[0]).toEqual({ offsetX: 100, offsetY: 100 });
  });

  it("should preserve original signal properties", () => {
    const { element } = createMockElement();
    const op = offset<SinglePointerSignal>({ target: element });

    const source = createStream<SinglePointerSignal>((observer) => {
      observer.next(createMockPointerSignal(150, 200));
      return () => {};
    });

    pipe(source, op).subscribe((v: OffsetPointerSignal) => {
      expect(v.value.x).toBe(150);
      expect(v.value.y).toBe(200);
      expect(v.kind).toBe("single-pointer");
    });
  });

  it("should recalculate rect on every event in auto mode", () => {
    const { element, getBoundingClientRect } = createMockElement();
    const op = offset<SinglePointerSignal>({ target: element, manual: false });

    const source = createStream<SinglePointerSignal>((observer) => {
      observer.next(createMockPointerSignal(100, 100));
      observer.next(createMockPointerSignal(100, 100));
      return () => {};
    });

    pipe(source, op).subscribe(() => {});

    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
  });

  it("should cache rect in manual mode until recalculate() is called", () => {
    const { element, getBoundingClientRect } = createMockElement();
    const op = offset<SinglePointerSignal>({ target: element, manual: true });

    const source = createStream<SinglePointerSignal>((observer) => {
      observer.next(createMockPointerSignal(100, 100));
      observer.next(createMockPointerSignal(100, 100));
      return () => {};
    });

    pipe(source, op).subscribe(() => {});

    expect(getBoundingClientRect).toHaveBeenCalledTimes(1);

    op.recalculate();
    expect(getBoundingClientRect).toHaveBeenCalledTimes(2);
  });

  it("should throw error if target is null", () => {
    expect(() => offset({ target: null as unknown as Element })).toThrow(
      "offset operator requires a valid target element",
    );
  });
});
