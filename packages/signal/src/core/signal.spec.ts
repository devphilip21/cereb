import { describe, it, expect } from "vitest";
import { createSignal } from "./signal.js";

describe("createSignal", () => {
  it("should create signal with type and deviceId", () => {
    const signal = createSignal("pointer", "mouse-1");

    expect(signal.type).toBe("pointer");
    expect(signal.deviceId).toBe("mouse-1");
    expect(typeof signal.timestamp).toBe("number");
  });

  it("should use performance.now() for timestamp", () => {
    const before = performance.now();
    const signal = createSignal("test", "device-1");
    const after = performance.now();

    expect(signal.timestamp).toBeGreaterThanOrEqual(before);
    expect(signal.timestamp).toBeLessThanOrEqual(after);
  });
});
