import { describe, expect, it } from "vitest";
import { calculateDistance, calculateVelocity, getDirection } from "./velocity.js";

describe("calculateVelocity", () => {
  it("should calculate positive X velocity for rightward movement", () => {
    const result = calculateVelocity(200, 100, 100, 100, 100, 0);

    expect(result.velocityX).toBe(1);
    expect(result.velocityY).toBe(0);
  });

  it("should calculate negative X velocity for leftward movement", () => {
    const result = calculateVelocity(0, 100, 100, 100, 100, 0);

    expect(result.velocityX).toBe(-1);
    expect(result.velocityY).toBe(0);
  });

  it("should calculate positive Y velocity for downward movement", () => {
    const result = calculateVelocity(100, 200, 100, 100, 100, 0);

    expect(result.velocityX).toBe(0);
    expect(result.velocityY).toBe(1);
  });

  it("should calculate velocity in pixels per millisecond", () => {
    const result = calculateVelocity(150, 100, 50, 100, 100, 0);

    expect(result.velocityX).toBe(1);
  });

  it("should return zero velocity when time delta is zero", () => {
    const result = calculateVelocity(200, 200, 100, 100, 100, 100);

    expect(result.velocityX).toBe(0);
    expect(result.velocityY).toBe(0);
  });

  it("should return zero velocity when time delta is negative", () => {
    const result = calculateVelocity(200, 200, 50, 100, 100, 100);

    expect(result.velocityX).toBe(0);
    expect(result.velocityY).toBe(0);
  });
});

describe("getDirection", () => {
  it("should return 'right' for positive horizontal movement", () => {
    expect(getDirection(50, 10)).toBe("right");
    expect(getDirection(50, -10)).toBe("right");
  });

  it("should return 'left' for negative horizontal movement", () => {
    expect(getDirection(-50, 10)).toBe("left");
    expect(getDirection(-50, -10)).toBe("left");
  });

  it("should return 'down' for positive vertical movement", () => {
    expect(getDirection(10, 50)).toBe("down");
    expect(getDirection(-10, 50)).toBe("down");
  });

  it("should return 'up' for negative vertical movement", () => {
    expect(getDirection(10, -50)).toBe("up");
    expect(getDirection(-10, -50)).toBe("up");
  });

  it("should return 'none' when no movement", () => {
    expect(getDirection(0, 0)).toBe("none");
  });

  it("should prioritize horizontal when equal absolute values", () => {
    expect(getDirection(10, 10)).toBe("down");
    expect(getDirection(-10, -10)).toBe("up");
  });
});

describe("calculateDistance", () => {
  it("should calculate horizontal distance", () => {
    const distance = calculateDistance(0, 0, 100, 0);

    expect(distance).toBe(100);
  });

  it("should calculate vertical distance", () => {
    const distance = calculateDistance(0, 0, 0, 100);

    expect(distance).toBe(100);
  });

  it("should calculate diagonal distance using Pythagorean theorem", () => {
    const distance = calculateDistance(0, 0, 3, 4);

    expect(distance).toBe(5);
  });

  it("should return zero for same points", () => {
    const distance = calculateDistance(50, 50, 50, 50);

    expect(distance).toBe(0);
  });
});
