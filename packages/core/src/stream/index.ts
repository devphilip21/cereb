/**
 * @cereb/stream
 *
 * A lightweight, tree-shakeable Observable implementation.
 *
 * @packageDocumentation
 */

// Event Observable
export type { EventObservable } from "./event-observable.js";
export { asBlockable, createEventObservable } from "./event-observable.js";
// Factory
export {
  defer,
  empty,
  from,
  fromEvent,
  fromMouseEvents,
  fromPointerEvents,
  fromPromise,
  fromTouchEvents,
  interval,
  never,
  of,
  throwError,
  timer,
} from "./factory.js";
// Core types
export type {
  Observable,
  Observer,
  Operator,
  Unsubscribe,
} from "./observable.js";
export { createObservable, toObserver } from "./observable.js";
// Operators
export * from "./operators/index.js";

// Pipe
export { compose, pipe } from "./pipe.js";
// Subject
export type { BehaviorSubject, Subject } from "./subject.js";
export { createBehaviorSubject, createSubject } from "./subject.js";

// Version
export const VERSION = "0.1.0";
