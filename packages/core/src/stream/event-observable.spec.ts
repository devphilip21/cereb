import { describe, expect, it, vi } from "vitest";
import { asBlockable, createEventObservable } from "./event-observable.js";
import { createObservable } from "./observable.js";

describe("createEventObservable", () => {
  it("should emit values when not blocked", () => {
    const values: number[] = [];

    const observable = createEventObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
    });

    observable.subscribe((v) => values.push(v));

    expect(values).toEqual([1, 2, 3]);
  });

  it("should drop events when blocked", () => {
    const values: number[] = [];
    let emit: (v: number) => void = () => {};

    const observable = createEventObservable<number>((observer) => {
      emit = (v) => observer.next(v);
    });

    observable.subscribe((v) => values.push(v));

    emit(1);
    observable.block();
    emit(2);
    emit(3);

    expect(values).toEqual([1]);
    expect(observable.isBlocked).toBe(true);
  });

  it("should resume emitting after unblock", () => {
    const values: number[] = [];
    let emit: (v: number) => void = () => {};

    const observable = createEventObservable<number>((observer) => {
      emit = (v) => observer.next(v);
    });

    observable.subscribe((v) => values.push(v));

    emit(1);
    observable.block();
    emit(2);
    observable.unblock();
    emit(3);

    expect(values).toEqual([1, 3]);
    expect(observable.isBlocked).toBe(false);
  });

  it("should block for all subscribers simultaneously", () => {
    const values1: number[] = [];
    const values2: number[] = [];
    const emitters: ((v: number) => void)[] = [];

    const observable = createEventObservable<number>((observer) => {
      emitters.push((v) => observer.next(v));
    });

    observable.subscribe((v) => values1.push(v));
    observable.subscribe((v) => values2.push(v));

    // Simulate an event going to all subscribers (like DOM events)
    emitters.forEach((emit) => {
      emit(1);
    });
    observable.block();
    emitters.forEach((emit) => {
      emit(2);
    });

    expect(values1).toEqual([1]);
    expect(values2).toEqual([1]);
  });

  it("should not block error signals", () => {
    const error = vi.fn();
    const testError = new Error("test");

    const observable = createEventObservable<number>((observer) => {
      observer.error?.(testError);
    });

    observable.block();
    observable.subscribe({ next: vi.fn(), error });

    expect(error).toHaveBeenCalledWith(testError);
  });

  it("should not block complete signals", () => {
    const complete = vi.fn();

    const observable = createEventObservable<number>((observer) => {
      observer.complete?.();
    });

    observable.block();
    observable.subscribe({ next: vi.fn(), complete });

    expect(complete).toHaveBeenCalled();
  });

  it("should call cleanup on unsubscribe", () => {
    const cleanup = vi.fn();

    const unsub = createEventObservable<number>((observer) => {
      observer.next(1);
      return cleanup;
    }).subscribe(vi.fn());

    unsub();

    expect(cleanup).toHaveBeenCalled();
  });
});

describe("asBlockable", () => {
  it("should convert Observable to EventObservable", () => {
    const values: number[] = [];
    let emit: (v: number) => void = () => {};

    const source = createObservable<number>((observer) => {
      emit = (v) => observer.next(v);
    });

    const blockable = asBlockable(source);

    blockable.subscribe((v) => values.push(v));

    emit(1);
    blockable.block();
    emit(2);
    blockable.unblock();
    emit(3);

    expect(values).toEqual([1, 3]);
  });

  it("should have block control methods", () => {
    const source = createObservable<number>(() => {});
    const blockable = asBlockable(source);

    expect(blockable.isBlocked).toBe(false);
    blockable.block();
    expect(blockable.isBlocked).toBe(true);
    blockable.unblock();
    expect(blockable.isBlocked).toBe(false);
  });

  it("should propagate error and complete from source", () => {
    const error = vi.fn();
    const complete = vi.fn();

    const source = createObservable<number>((observer) => {
      observer.complete?.();
    });

    asBlockable(source).subscribe({ next: vi.fn(), error, complete });

    expect(complete).toHaveBeenCalled();
  });
});
