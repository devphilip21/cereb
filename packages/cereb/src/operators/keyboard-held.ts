import { keyboard, type ModifierKey } from "../browser/keyboard/keyboard.js";
import type { KeyboardSignal } from "../browser/keyboard/keyboard-signal.js";
import type { Signal } from "../core/signal.js";
import { createSignal } from "../core/signal.js";
import type { Stream } from "../core/stream.js";
import { createStream } from "../core/stream.js";
import { share } from "./share.js";

export interface HeldValue {
  held: boolean;
}

export interface HeldSignal extends Signal<"held", HeldValue> {}

export const HELD_SIGNAL_KIND = "held" as const;

export interface KeyboardHeldOptions {
  /**
   * The key to track. Case-insensitive.
   * @example 'z', 'Enter', 'Escape'
   */
  key: string;

  /**
   * Modifier keys that must also be held. Uses OR logic.
   * @example ['meta', 'ctrl'] - matches if metaKey OR ctrlKey is pressed
   */
  modifiers?: ModifierKey[];
}

/**
 * Cache for shared keyboard streams per EventTarget.
 * Using WeakMap ensures streams are garbage collected when targets are removed.
 */
const sharedKeyboardStreams = new WeakMap<EventTarget, Stream<KeyboardSignal>>();

function getSharedKeyboard(target: EventTarget): Stream<KeyboardSignal> {
  let stream = sharedKeyboardStreams.get(target);
  if (!stream) {
    stream = share<KeyboardSignal>()(keyboard(target));
    sharedKeyboardStreams.set(target, stream);
  }
  return stream;
}

/**
 * Creates a stream that tracks whether a specific key (and optionally modifiers) is being held down.
 *
 * Automatically shares the keyboard stream for the same EventTarget, so multiple
 * keyboardHeld calls on the same target reuse the same underlying event listeners.
 *
 * This function correctly handles the case where modifier keys are released before
 * the main key. It tracks the main key's down/up state independently and checks
 * modifier states from each keyboard event.
 *
 * @param target - EventTarget to listen for keyboard events (e.g., window, document, element)
 * @param options - Key and modifier configuration
 * @returns Stream that emits { held: true } when conditions are met, { held: false } otherwise
 *
 * @example
 * ```typescript
 * // Track if Ctrl+Z or Cmd+Z is held
 * const isZoomModeHeld$ = keyboardHeld(window, {
 *   key: 'z',
 *   modifiers: ['meta', 'ctrl']
 * });
 *
 * // Multiple calls on same target share the keyboard stream
 * const isXHeld$ = keyboardHeld(window, { key: 'x' });
 *
 * // Use with when() operator
 * pipe(
 *   wheel(element),
 *   when(isZoomModeHeld$)
 * ).subscribe(...)
 * ```
 */
export function keyboardHeld(
  target: EventTarget,
  options: KeyboardHeldOptions,
): Stream<HeldSignal> {
  const { key, modifiers } = options;
  const keyLower = key.toLowerCase();
  const source = getSharedKeyboard(target);

  const checkModifiers = (value: KeyboardSignal["value"]): boolean => {
    if (!modifiers || modifiers.length === 0) return true;
    return modifiers.some((mod) => {
      switch (mod) {
        case "meta":
          return value.metaKey;
        case "ctrl":
          return value.ctrlKey;
        case "alt":
          return value.altKey;
        case "shift":
          return value.shiftKey;
        default:
          return false;
      }
    });
  };

  return createStream((observer) => {
    let keyHeld = false;

    return source.subscribe({
      next(signal) {
        try {
          const { key: eventKey, phase } = signal.value;

          // Update key state only for the target key
          if (eventKey.toLowerCase() === keyLower) {
            keyHeld = phase === "down";
          }

          // Check modifier state from current event
          const modifierHeld = checkModifiers(signal.value);

          // Emit held: true only when both conditions are met
          const held = keyHeld && modifierHeld;
          observer.next(createSignal(HELD_SIGNAL_KIND, { held }));
        } catch (err) {
          observer.error?.(err);
        }
      },
      error: observer.error?.bind(observer),
      complete: observer.complete?.bind(observer),
    });
  });
}
