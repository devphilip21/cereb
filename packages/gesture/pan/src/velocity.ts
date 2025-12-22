import type { PanDirection } from "./types.js";

export interface VelocityResult {
  velocityX: number;
  velocityY: number;
}

/**
 * Calculate velocity using time-based delta calculation.
 * Returns velocity in pixels per millisecond.
 */
export function calculateVelocity(
  currentX: number,
  currentY: number,
  currentTimestamp: number,
  prevX: number,
  prevY: number,
  prevTimestamp: number,
): VelocityResult {
  const timeDelta = currentTimestamp - prevTimestamp;

  // Prevent division by zero
  if (timeDelta <= 0) {
    return { velocityX: 0, velocityY: 0 };
  }

  const dx = currentX - prevX;
  const dy = currentY - prevY;

  return {
    velocityX: dx / timeDelta,
    velocityY: dy / timeDelta,
  };
}

/**
 * Determine primary direction from delta values.
 */
export function getDirection(deltaX: number, deltaY: number): PanDirection {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX === 0 && absY === 0) {
    return "none";
  }

  if (absX > absY) {
    return deltaX > 0 ? "right" : "left";
  }

  return deltaY > 0 ? "down" : "up";
}

/**
 * Calculate Euclidean distance between two points.
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
