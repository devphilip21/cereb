import { createSignal, type Signal } from "../../core/signal.js";
import type { DeepMutable } from "../../internal/types.js";
import type { SinglePointerButton, SinglePointerPhase, SinglePointerType } from "./types.js";

export interface SinglePointerSignal extends Signal<"single-pointer", SinglePointer> {}

export const SINGLE_POINTER_SIGNAL_KIND = "single-pointer" as const;

/**
 * Normalized pointer data representing a single point of contact.
 * Abstracts away differences between mouse, touch, and pointer events.
 */
export interface SinglePointer {
  phase: SinglePointerPhase;
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  pointerType: SinglePointerType;
  button: SinglePointerButton;
  /** 0.0 ~ 1.0, default 0.5 if unsupported */
  pressure: number;
  id: string;
}

export function createSinglePointerSignal(pointer: SinglePointer): SinglePointerSignal {
  return createSignal(SINGLE_POINTER_SIGNAL_KIND, pointer);
}

export function createDefaultSinglePointerSignal(): SinglePointerSignal {
  return createSinglePointerSignal({
    id: "",
    phase: "move",
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
    pointerType: "unknown",
    button: "none",
    pressure: 0.5,
  });
}

export function resetSinglePointerValue(value: SinglePointer): void {
  const v = value as DeepMutable<SinglePointer>;
  v.phase = "move";
  v.x = 0;
  v.y = 0;
  v.pageX = 0;
  v.pageY = 0;
  v.pointerType = "unknown";
  v.button = "none";
  v.pressure = 0.5;
}

export function createDefaultSinglePointerValue(): SinglePointer {
  return {
    id: "",
    phase: "move",
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
    pointerType: "unknown",
    button: "none",
    pressure: 0.5,
  };
}
