import { describe, it, expect } from "vitest";
import {
  eventTypeToPhase,
  normalizePointerType,
  getButton,
  getDeviceId,
} from "./utils.js";

describe("eventTypeToPhase", () => {
  it("should map start events to 'start'", () => {
    expect(eventTypeToPhase("pointerdown")).toBe("start");
    expect(eventTypeToPhase("mousedown")).toBe("start");
    expect(eventTypeToPhase("touchstart")).toBe("start");
  });

  it("should map move events to 'move'", () => {
    expect(eventTypeToPhase("pointermove")).toBe("move");
    expect(eventTypeToPhase("mousemove")).toBe("move");
    expect(eventTypeToPhase("touchmove")).toBe("move");
  });

  it("should map end events to 'end'", () => {
    expect(eventTypeToPhase("pointerup")).toBe("end");
    expect(eventTypeToPhase("mouseup")).toBe("end");
    expect(eventTypeToPhase("touchend")).toBe("end");
  });

  it("should map cancel events to 'cancel'", () => {
    expect(eventTypeToPhase("pointercancel")).toBe("cancel");
    expect(eventTypeToPhase("touchcancel")).toBe("cancel");
  });

  it("should default to 'move' for unknown events", () => {
    expect(eventTypeToPhase("unknown")).toBe("move");
  });
});

describe("normalizePointerType", () => {
  it("should normalize known pointer types", () => {
    expect(normalizePointerType("mouse")).toBe("mouse");
    expect(normalizePointerType("touch")).toBe("touch");
    expect(normalizePointerType("pen")).toBe("pen");
  });

  it("should return 'unknown' for unrecognized types", () => {
    expect(normalizePointerType("stylus")).toBe("unknown");
    expect(normalizePointerType("")).toBe("unknown");
  });
});

describe("getButton", () => {
  it("should return 'none' for move events", () => {
    const event = { type: "pointermove", button: 0 } as PointerEvent;

    expect(getButton(event)).toBe("none");
  });

  it("should return button type for non-move events", () => {
    expect(getButton({ type: "pointerdown", button: 0 } as PointerEvent)).toBe(
      "primary"
    );
    expect(getButton({ type: "pointerdown", button: 2 } as PointerEvent)).toBe(
      "secondary"
    );
  });
});

describe("getDeviceId", () => {
  it("should return pointer-based id for PointerEvent", () => {
    const event = {
      pointerType: "mouse",
      pointerId: 1,
    } as PointerEvent;

    expect(getDeviceId(event)).toBe("mouse-1");
  });

  it("should return 'touch-device' for TouchEvent", () => {
    const event = { touches: [] } as unknown as TouchEvent;

    expect(getDeviceId(event)).toBe("touch-device");
  });

  it("should return 'mouse-device' for MouseEvent", () => {
    const event = {} as MouseEvent;

    expect(getDeviceId(event)).toBe("mouse-device");
  });
});
