import type { Observable, Operator } from "./observable.js";

export function pipe<T>(source: Observable<T>): Observable<T>;
export function pipe<T, A>(source: Observable<T>, op1: Operator<T, A>): Observable<A>;
export function pipe<T, A, B>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>
): Observable<B>;
export function pipe<T, A, B, C>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>
): Observable<C>;
export function pipe<T, A, B, C, D>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>
): Observable<D>;
export function pipe<T, A, B, C, D, E>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>
): Observable<E>;
export function pipe<T, A, B, C, D, E, F>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>
): Observable<F>;
export function pipe<T, A, B, C, D, E, F, G>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>
): Observable<G>;
export function pipe<T, A, B, C, D, E, F, G, H>(
  source: Observable<T>,
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>,
  op6: Operator<E, F>,
  op7: Operator<F, G>,
  op8: Operator<G, H>
): Observable<H>;
export function pipe<T>(
  source: Observable<T>,
  ...operators: Operator<unknown, unknown>[]
): Observable<unknown>;
export function pipe<T>(
  source: Observable<T>,
  ...operators: Operator<unknown, unknown>[]
): Observable<unknown> {
  return operators.reduce(
    (prev, op) => op(prev),
    source as Observable<unknown>
  );
}

export function compose<T, A>(op1: Operator<T, A>): Operator<T, A>;
export function compose<T, A, B>(
  op1: Operator<T, A>,
  op2: Operator<A, B>
): Operator<T, B>;
export function compose<T, A, B, C>(
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>
): Operator<T, C>;
export function compose<T, A, B, C, D>(
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>
): Operator<T, D>;
export function compose<T, A, B, C, D, E>(
  op1: Operator<T, A>,
  op2: Operator<A, B>,
  op3: Operator<B, C>,
  op4: Operator<C, D>,
  op5: Operator<D, E>
): Operator<T, E>;
export function compose(
  ...operators: Operator<unknown, unknown>[]
): Operator<unknown, unknown>;
export function compose(
  ...operators: Operator<unknown, unknown>[]
): Operator<unknown, unknown> {
  return (source) => pipe(source, ...operators);
}
