export interface Signal<K extends string = string, V = unknown> {
  kind: K;
  value: V;
  deviceId: string;
  createdAt: number;
  updatedAt?: number;
}
