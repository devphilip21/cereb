import type { Signal } from "../core/signal.js";
import type { Stream } from "../core/stream.js";
import { createStream } from "../core/stream.js";

export interface TestSignal<V = unknown> extends Signal<"test", V> {
  kind: "test";
  value: V;
}

export function createTestSignal<V>(value: V): TestSignal<V> {
  return {
    kind: "test",
    value,
    deviceId: "test-device",
    createdAt: Date.now(),
  };
}

export function fromArray<V>(values: V[]): Stream<TestSignal<V>> {
  return createStream((observer) => {
    for (const value of values) {
      observer.next(createTestSignal(value));
    }
    observer.complete?.();
    return () => {};
  });
}

export function ofValue<V>(value: V): Stream<TestSignal<V>> {
  return fromArray([value]);
}
