export type {
  Signal,
  SignalWithMetadata,
  CancellableSignal,
  SignalPhase,
} from "./signal.js";
export { createSignal } from "./signal.js";

export type { SignalPool } from "./pool.js";
export { createSignalPool } from "./pool.js";

export const VERSION = "0.2.0";
