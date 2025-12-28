import { createStream, type Stream } from "../../core/stream.js";
import { createKeyboardSignalFromEvent, type KeyboardSignal } from "./keyboard-signal.js";

export type ModifierKey = "meta" | "ctrl" | "alt" | "shift";

export interface KeyboardOptions {
  /**
   * Filter by key value(s). Uses OR logic if array.
   * Comparison is case-insensitive.
   * @example 'z' or ['+', '-', '=']
   */
  key?: string | string[];

  /**
   * Filter by modifier keys. Uses OR logic (matches if any is pressed).
   * @example ['meta', 'ctrl'] - matches if metaKey OR ctrlKey is pressed
   */
  modifiers?: ModifierKey[];

  /**
   * If true, calls preventDefault() on matching events.
   * @default false
   */
  preventDefault?: boolean;
}

/**
 * Creates a stream of keyboard signals from keydown and keyup events on the target.
 * Optionally filters by key and/or modifier keys.
 *
 * @example
 * ```typescript
 * // All keyboard events
 * keyboard(window).subscribe(signal => {
 *   console.log(signal.value.key, signal.value.phase);
 * });
 *
 * // Only +/- keys with Ctrl or Cmd
 * keyboard(window, { key: ['+', '-'], modifiers: ['meta', 'ctrl'] }).subscribe(signal => {
 *   // zoom in/out
 * });
 * ```
 */
export function keyboard(target: EventTarget, options?: KeyboardOptions): Stream<KeyboardSignal> {
  const keyList = options?.key
    ? Array.isArray(options.key)
      ? options.key.map((k) => k.toLowerCase())
      : [options.key.toLowerCase()]
    : null;
  const modifiers = options?.modifiers;
  const preventDefault = options?.preventDefault ?? false;

  const matchesKey = (key: string): boolean => {
    if (!keyList) return true;
    return keyList.includes(key.toLowerCase());
  };

  const matchesModifiers = (e: KeyboardEvent): boolean => {
    if (!modifiers || modifiers.length === 0) return true;
    return modifiers.some((mod) => {
      switch (mod) {
        case "meta":
          return e.metaKey;
        case "ctrl":
          return e.ctrlKey;
        case "alt":
          return e.altKey;
        case "shift":
          return e.shiftKey;
        default:
          return false;
      }
    });
  };

  const matches = (e: KeyboardEvent): boolean => {
    return matchesKey(e.key) && matchesModifiers(e);
  };

  return createStream<KeyboardSignal>((observer) => {
    const handleKeyDown = (e: Event) => {
      const event = e as KeyboardEvent;
      if (!matches(event)) return;
      if (preventDefault) event.preventDefault();
      observer.next(createKeyboardSignalFromEvent(event, "down"));
    };

    const handleKeyUp = (e: Event) => {
      const event = e as KeyboardEvent;
      if (!matches(event)) return;
      if (preventDefault) event.preventDefault();
      observer.next(createKeyboardSignalFromEvent(event, "up"));
    };

    target.addEventListener("keydown", handleKeyDown);
    target.addEventListener("keyup", handleKeyUp);

    return () => {
      target.removeEventListener("keydown", handleKeyDown);
      target.removeEventListener("keyup", handleKeyUp);
    };
  });
}
