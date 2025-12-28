import type { PointerInfo } from "cereb";

/**
 * Calculate Euclidean distance between two points.
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance between two pointers.
 */
export function getPointerDistance(p1: PointerInfo, p2: PointerInfo): number {
  return calculateDistance(p1.x, p1.y, p2.x, p2.y);
}

/**
 * Calculate center point between two pointers (client coordinates).
 */
export function getCenter(p1: PointerInfo, p2: PointerInfo): { centerX: number; centerY: number } {
  return {
    centerX: (p1.x + p2.x) / 2,
    centerY: (p1.y + p2.y) / 2,
  };
}

/**
 * Calculate center point between two pointers (page coordinates).
 */
export function getPageCenter(
  p1: PointerInfo,
  p2: PointerInfo,
): { pageCenterX: number; pageCenterY: number } {
  return {
    pageCenterX: (p1.pageX + p2.pageX) / 2,
    pageCenterY: (p1.pageY + p2.pageY) / 2,
  };
}

/**
 * Clamp a value between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
