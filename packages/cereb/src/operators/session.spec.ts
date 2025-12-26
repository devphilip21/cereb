import { describe, expect, it, vi } from "vitest";
import type { Signal } from "../core/signal.js";
import { createStream } from "../core/stream.js";
import { session } from "./session.js";

type Phase = "start" | "move" | "end" | "cancel";

interface PointerValue {
  phase: Phase;
  x: number;
  y: number;
}

function createPointerSignal(phase: Phase, x = 0, y = 0): Signal<"pointer", PointerValue> {
  return {
    kind: "pointer",
    value: { phase, x, y },
    deviceId: "test",
    createdAt: performance.now(),
  };
}

describe("session", () => {
  it("should emit signals only during active session (start to end)", () => {
    const signals: Signal<"pointer", PointerValue>[] = [];
    const operator = session<Signal<"pointer", PointerValue>>({
      start: (s) => s.value.phase === "start",
      end: (s) => s.value.phase === "end",
    });

    const source = createStream<Signal<"pointer", PointerValue>>((observer) => {
      observer.next(createPointerSignal("move", 0, 0)); // ignored (before session)
      observer.next(createPointerSignal("start", 10, 10)); // session start
      observer.next(createPointerSignal("move", 20, 20)); // emitted
      observer.next(createPointerSignal("move", 30, 30)); // emitted
      observer.next(createPointerSignal("end", 40, 40)); // session end
      observer.next(createPointerSignal("move", 50, 50)); // ignored (after session)
      return () => {};
    });

    operator(source).subscribe({ next: (v) => signals.push(v) });

    expect(signals).toHaveLength(4);
    expect(signals[0].value.phase).toBe("start");
    expect(signals[1].value.phase).toBe("move");
    expect(signals[2].value.phase).toBe("move");
    expect(signals[3].value.phase).toBe("end");
  });

  it("should support multiple sessions", () => {
    const signals: Signal<"pointer", PointerValue>[] = [];
    const operator = session<Signal<"pointer", PointerValue>>({
      start: (s) => s.value.phase === "start",
      end: (s) => s.value.phase === "end" || s.value.phase === "cancel",
    });

    const source = createStream<Signal<"pointer", PointerValue>>((observer) => {
      // First session
      observer.next(createPointerSignal("start", 0, 0));
      observer.next(createPointerSignal("move", 10, 10));
      observer.next(createPointerSignal("end", 20, 20));
      // Gap
      observer.next(createPointerSignal("move", 25, 25)); // ignored
      // Second session
      observer.next(createPointerSignal("start", 30, 30));
      observer.next(createPointerSignal("move", 40, 40));
      observer.next(createPointerSignal("cancel", 50, 50));
      return () => {};
    });

    operator(source).subscribe({ next: (v) => signals.push(v) });

    expect(signals).toHaveLength(6);
    expect(signals.map((s) => s.value.phase)).toEqual([
      "start",
      "move",
      "end",
      "start",
      "move",
      "cancel",
    ]);
  });

  it("should propagate errors from predicates", () => {
    const errorHandler = vi.fn();
    const operator = session<Signal<"pointer", PointerValue>>({
      start: () => {
        throw new Error("predicate error");
      },
      end: () => false,
    });

    const source = createStream<Signal<"pointer", PointerValue>>((observer) => {
      observer.next(createPointerSignal("start"));
      return () => {};
    });

    operator(source).subscribe({ next: () => {}, error: errorHandler });

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
  });
});
