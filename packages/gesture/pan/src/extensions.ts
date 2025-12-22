/**
 * Extension interface for velocity data.
 * Added to PanEvent when using withVelocity() operator.
 */
export interface VelocityExtension {
  /** X velocity in pixels per millisecond */
  velocityX: number;
  /** Y velocity in pixels per millisecond */
  velocityY: number;
}
