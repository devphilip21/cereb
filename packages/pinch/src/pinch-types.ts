export type PinchPhase = "unknown" | "start" | "change" | "end" | "cancel";

export interface PinchOptions {
  /**
   * Minimum distance change (in pixels) required before pinch gesture is recognized.
   * @default 0
   */
  threshold?: number;
}
