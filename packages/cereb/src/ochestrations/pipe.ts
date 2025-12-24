import type { Signal } from "../core/signal.js";
import type { Operator, Stream } from "../core/stream.js";

export function pipe<T extends Signal>(source: Stream<T>): Stream<T>;
export function pipe<T extends Signal, A extends Signal>(
  source: Stream<T>,
  op1: Operator<T, A>,
): Stream<A>;
export function pipe<T extends Signal, A extends Signal, B extends Signal>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
): Stream<B>;
export function pipe<T extends Signal, A extends Signal, B extends Signal, C extends Signal>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
): Stream<C>;
export function pipe<
  T extends Signal,
  A extends Signal,
  B extends Signal,
  C extends Signal,
  D extends Signal,
>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
): Stream<D>;
export function pipe<
  T extends Signal,
  A extends Signal,
  B extends Signal,
  C extends Signal,
  D extends Signal,
  E extends Signal,
>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
): Stream<E>;
export function pipe<
  T extends Signal,
  A extends Signal,
  B extends Signal,
  C extends Signal,
  D extends Signal,
  E extends Signal,
  F extends Signal,
>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
): Stream<F>;
export function pipe<
  T extends Signal,
  A extends Signal,
  B extends Signal,
  C extends Signal,
  D extends Signal,
  E extends Signal,
  F extends Signal,
  G extends Signal,
>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>,
): Stream<G>;
export function pipe<
  T extends Signal,
  A extends Signal,
  B extends Signal,
  C extends Signal,
  D extends Signal,
  E extends Signal,
  F extends Signal,
  G extends Signal,
  H extends Signal,
>(
  source: Stream<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>,
  op8: Operator<G, H>,
): Stream<H>;
export function pipe<T extends Signal>(
  source: Stream<T>,
  ...operators: Operator<Signal, Signal>[]
): Stream<Signal>;
export function pipe<T extends Signal>(
  source: Stream<T>,
  ...operators: Operator<Signal, Signal>[]
): Stream<Signal> {
  return operators.reduce((prev, op) => op(prev), source as Stream<Signal>);
}
