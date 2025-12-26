import type { DeepMutable, Mutable } from "../internal/types.js";
import { getCerebDeviceId } from "./meta.js";
import type { Signal } from "./signal.js";

/**
 * Configuration for a specific Signal kind.
 * Each kind must provide functions to create and reset its value type.
 */
export interface SignalKindConfig<V> {
  createValue: () => V;
  resetValue: (value: V) => void;
}

export interface SignalPoolOptions {
  initialSize?: number;
  maxSize?: number;
}

/**
 * Unified pool for managing Signal objects across all kinds.
 * Handles object reuse to minimize GC pressure in high-frequency scenarios.
 */
export interface SignalPool {
  registerKind<K extends string, V>(
    kind: K,
    config: SignalKindConfig<V>,
    options?: SignalPoolOptions,
  ): void;

  acquire<K extends string, V>(kind: K): Signal<K, V>;
  release(signal: Signal): void;

  getPoolSize(kind: string): number;
  readonly registeredKinds: readonly string[];
}

interface KindPoolEntry<V = unknown> {
  config: SignalKindConfig<V>;
  pool: Signal[];
  maxSize: number;
}

const DEFAULT_INITIAL_SIZE = 0;
const DEFAULT_MAX_SIZE = 100;

/**
 * Creates a unified SignalPool that manages pools for multiple Signal kinds.
 */
export function createSignalPool(): SignalPool {
  const kindPools = new Map<string, KindPoolEntry>();

  function resetSignalCommon(signal: Mutable<Signal>): void {
    signal.deviceId = getCerebDeviceId();
    signal.createdAt = performance.now();
    signal.updatedAt = undefined;
  }

  function createSignalForKind<K extends string, V>(
    kind: K,
    entry: KindPoolEntry<V>,
  ): Signal<K, V> {
    return {
      kind,
      value: entry.config.createValue(),
      deviceId: getCerebDeviceId(),
      createdAt: performance.now(),
    };
  }

  return {
    registerKind<K extends string, V>(
      kind: K,
      config: SignalKindConfig<V>,
      options: SignalPoolOptions = {},
    ): void {
      const { initialSize = DEFAULT_INITIAL_SIZE, maxSize = DEFAULT_MAX_SIZE } = options;

      const entry: KindPoolEntry<V> = {
        config,
        pool: [],
        maxSize,
      };

      for (let i = 0; i < initialSize; i++) {
        entry.pool.push(createSignalForKind(kind, entry));
      }

      kindPools.set(kind, entry as KindPoolEntry);
    },

    acquire<K extends string, V>(kind: K): Signal<K, V> {
      const entry = kindPools.get(kind) as KindPoolEntry<V> | undefined;

      if (!entry) {
        throw new Error(`Signal kind "${kind}" is not registered. Call registerKind first.`);
      }

      if (entry.pool.length > 0) {
        return entry.pool.pop() as Signal<K, V>;
      }

      return createSignalForKind(kind, entry);
    },

    release(signal: Signal): void {
      const entry = kindPools.get(signal.kind);

      if (!entry) {
        return;
      }

      if (entry.pool.length < entry.maxSize) {
        const mutableSignal = signal as DeepMutable<Signal>;
        resetSignalCommon(mutableSignal);
        entry.config.resetValue(mutableSignal.value);
        entry.pool.push(signal);
      }
    },

    getPoolSize(kind: string): number {
      const entry = kindPools.get(kind);
      return entry ? entry.pool.length : 0;
    },

    get registeredKinds(): readonly string[] {
      return Array.from(kindPools.keys());
    },
  };
}

/**
 * Global signal pool instance for shared use across the application.
 */
export const signalPool = createSignalPool();
