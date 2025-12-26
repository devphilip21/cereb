import { signalPool } from "cereb";
import {
  createDefaultPanValue,
  PAN_SIGNAL_KIND,
  type PanSignal,
  resetPanValue,
} from "./pan-signal.js";

signalPool.registerKind(
  PAN_SIGNAL_KIND,
  {
    createValue: createDefaultPanValue,
    resetValue: resetPanValue,
  },
  {
    initialSize: 20,
    maxSize: 100,
  },
);

export function acquirePanSignal(): PanSignal {
  return signalPool.acquire(PAN_SIGNAL_KIND);
}

export function releasePanSignal(signal: PanSignal): void {
  signalPool.release(signal);
}
