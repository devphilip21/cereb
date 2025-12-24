/**
 * @cereb/core
 *
 * Core abstractions for cereb: stream, signal, and gesture.
 *
 * @packageDocumentation
 */

// Gesture
export type { GestureEvent, GesturePhase } from "./gesture/event.js";
export { isPrevented, PREVENTED } from "./gesture/event.js";
export { excludePrevented } from "./gesture/operators/index.js";
export { createGestureEventPool } from "./gesture/pool.js";
// Signal
export type { SignalPool } from "./signal/pool.js";
export { createSignalPool } from "./signal/pool.js";
export type {
  CancellableSignal,
  Signal,
  SignalPhase,
  SignalWithMetadata,
} from "./signal/signal.js";
export { createSignal } from "./signal/signal.js";
// Stream
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
} from "./stream/factory.js";
export type {
  Observable,
  Observer,
  Operator,
  Unsubscribe,
} from "./stream/observable.js";
export { createObservable, toObserver } from "./stream/observable.js";
export {
  buffer,
  bufferTime,
  bufferWhen,
  combineLatest,
  debounce,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  forkJoin,
  map,
  merge,
  mergeWith,
  share,
  shareReplay,
  skip,
  skipUntil,
  skipWhile,
  take,
  takeUntil,
  takeWhile,
  tap,
  throttle,
  throttleLast,
} from "./stream/operators/index.js";
export { compose, pipe } from "./stream/pipe.js";
export type { BehaviorSubject, Subject } from "./stream/subject.js";
export { createBehaviorSubject, createSubject } from "./stream/subject.js";
