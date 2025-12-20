import { describe, it, expect } from "vitest";
import {
  createDefaultSinglePointer,
  resetSinglePointer,
  isSinglePointer,
} from "./signal.js";
import type { Signal } from "@gesturejs/signal";

describe("createDefaultSinglePointer", () => {
  it("should create pointer with default values", () => {
    const pointer = createDefaultSinglePointer();

    expect(pointer).toEqual({
      type: "pointer",
      timestamp: 0,
      deviceId: "",
      phase: "move",
      x: 0,
      y: 0,
      pointerType: "unknown",
      button: "none",
      pressure: 0.5,
    });
  });
});

describe("resetSinglePointer", () => {
  it("should reset pointer to default values", () => {
    const pointer = createDefaultSinglePointer();
    pointer.timestamp = 100;
    pointer.deviceId = "mouse-1";
    pointer.phase = "start";
    pointer.x = 150;
    pointer.y = 200;
    pointer.pointerType = "mouse";
    pointer.button = "primary";
    pointer.pressure = 1.0;

    resetSinglePointer(pointer);

    expect(pointer.timestamp).toBe(0);
    expect(pointer.deviceId).toBe("");
    expect(pointer.phase).toBe("move");
    expect(pointer.x).toBe(0);
    expect(pointer.y).toBe(0);
    expect(pointer.pointerType).toBe("unknown");
    expect(pointer.button).toBe("none");
    expect(pointer.pressure).toBe(0.5);
  });
});

describe("isSinglePointer", () => {
  it("should return true for pointer type signal", () => {
    const signal: Signal = { type: "pointer", timestamp: 0, deviceId: "" };

    expect(isSinglePointer(signal)).toBe(true);
  });

  it("should return false for non-pointer signal", () => {
    const signal: Signal = { type: "gesture", timestamp: 0, deviceId: "" };

    expect(isSinglePointer(signal)).toBe(false);
  });
});
