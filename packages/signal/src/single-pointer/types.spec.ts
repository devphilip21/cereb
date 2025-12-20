import { describe, it, expect } from "vitest";
import { toPointerButton } from "./types.js";

describe("toPointerButton", () => {
  it("should map standard mouse buttons", () => {
    expect(toPointerButton(-1)).toBe("none");
    expect(toPointerButton(0)).toBe("primary");
    expect(toPointerButton(1)).toBe("auxiliary");
    expect(toPointerButton(2)).toBe("secondary");
    expect(toPointerButton(3)).toBe("back");
    expect(toPointerButton(4)).toBe("forward");
  });

  it("should return 'none' for unknown button numbers", () => {
    expect(toPointerButton(5)).toBe("none");
    expect(toPointerButton(99)).toBe("none");
  });
});
