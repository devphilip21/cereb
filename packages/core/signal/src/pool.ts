import type { Signal } from "./signal.js";

export interface SignalPool<T extends Signal> {
  acquire(): T;
  release(obj: T): void;
  clear(): void;
  readonly size: number;
  readonly active: number;
}

/** Pre-allocates and reuses Signal objects to reduce GC pressure. */
export function createSignalPool<T extends Signal>(
  factory: () => T,
  reset: (obj: T) => void,
  initialSize = 20,
  maxSize = 100
): SignalPool<T> {
  const pool: T[] = [];
  let activeCount = 0;

  for (let i = 0; i < initialSize; i++) {
    pool.push(factory());
  }

  return {
    acquire(): T {
      activeCount++;
      if (pool.length > 0) {
        return pool.pop()!;
      }
      return factory();
    },

    release(obj: T): void {
      activeCount--;
      reset(obj);
      if (pool.length < maxSize) {
        pool.push(obj);
      }
    },

    clear(): void {
      pool.length = 0;
      activeCount = 0;
    },

    get size(): number {
      return pool.length;
    },

    get active(): number {
      return activeCount;
    },
  };
}
