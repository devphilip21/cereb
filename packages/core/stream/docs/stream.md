# Stream API

A lightweight, tree-shakeable Observable implementation.

## Core Concepts

### Observable

An Observable is simply an object with a `subscribe` method:

```typescript
interface Observable<T> {
  subscribe(observer: Observer<T> | ((value: T) => void)): Unsubscribe;
}
```

### pipe()

Compose operators using `pipe()`:

```typescript
import { pipe, filter, map, throttle } from "@gesturejs/signal";

const result = pipe(
  source,
  filter(x => x > 0),
  map(x => x * 2),
  throttle(100)
);
```

---

## Creating Observables

### createSubject

A Subject can be subscribed to and pushed to:

```typescript
import { createSubject } from "@gesturejs/signal";

const subject = createSubject<number>();

subject.subscribe(value => console.log(value));

subject.next(1);
subject.next(2);
subject.complete();
```

### createBehaviorSubject

Replays the last value to new subscribers:

```typescript
import { createBehaviorSubject } from "@gesturejs/signal";

const subject = createBehaviorSubject(0);  // initial value

subject.subscribe(v => console.log(v));  // logs 0 immediately

subject.next(1);  // logs 1
subject.getValue();  // returns 1
```

### fromEvent

```typescript
import { fromEvent } from "@gesturejs/signal";

const clicks = fromEvent<MouseEvent>(document, "click");
const keydowns = fromEvent<KeyboardEvent>(window, "keydown");
```

### fromPromise

```typescript
import { fromPromise } from "@gesturejs/signal";

const data = fromPromise(fetch("/api").then(r => r.json()));
```

### of / from

```typescript
import { of, from } from "@gesturejs/signal";

of(42).subscribe(v => console.log(v));  // 42

from([1, 2, 3]).subscribe(v => console.log(v));  // 1, 2, 3
```

### interval / timer

```typescript
import { interval, timer } from "@gesturejs/signal";

interval(1000).subscribe(n => console.log(n));  // 0, 1, 2, ...

timer(500).subscribe(() => console.log("done"));
```

---

## Operators

All operators are standalone functions that return an `Operator<T, R>`.

### Transformation

#### filter

```typescript
import { pipe, filter } from "@gesturejs/signal";

pipe(
  source,
  filter(n => n % 2 === 0)
).subscribe(console.log);
```

#### map

```typescript
import { pipe, map } from "@gesturejs/signal";

pipe(
  source,
  map(n => n * 2)
).subscribe(console.log);
```

#### tap

Execute side effects without modifying values:

```typescript
import { pipe, tap, map } from "@gesturejs/signal";

pipe(
  source,
  tap(v => console.log("before:", v)),
  map(v => v * 2),
  tap(v => console.log("after:", v))
).subscribe(console.log);
```

### Timing

#### throttle

Emit at most once per interval (first value):

```typescript
import { pipe, throttle } from "@gesturejs/signal";

pipe(
  mouseMoves,
  throttle(16)  // ~60fps
).subscribe(handleMove);
```

#### debounce

Emit after silence:

```typescript
import { pipe, debounce } from "@gesturejs/signal";

pipe(
  searchInput,
  debounce(300)
).subscribe(query => search(query));
```

### Filtering

#### take / takeWhile / takeUntil

```typescript
import { pipe, take, takeUntil } from "@gesturejs/signal";

pipe(source, take(3)).subscribe(console.log);  // first 3

const stop$ = fromEvent(button, "click");
pipe(source, takeUntil(stop$)).subscribe(console.log);
```

#### skip / skipWhile / skipUntil

```typescript
import { pipe, skip, skipUntil } from "@gesturejs/signal";

pipe(source, skip(2)).subscribe(console.log);  // skip first 2
```

#### distinctUntilChanged

```typescript
import { pipe, distinctUntilChanged } from "@gesturejs/signal";

pipe(
  source,
  distinctUntilChanged()
).subscribe(console.log);

// Custom comparator
pipe(
  source,
  distinctUntilChanged((a, b) => a.id === b.id)
).subscribe(console.log);
```

### Buffering

#### buffer / bufferTime

```typescript
import { pipe, buffer, bufferTime } from "@gesturejs/signal";

pipe(source, buffer(5)).subscribe(arr => console.log(arr));

pipe(source, bufferTime(1000)).subscribe(arr => console.log(arr));
```

### Combination

#### merge

```typescript
import { merge } from "@gesturejs/signal";

merge(stream1, stream2, stream3).subscribe(console.log);
```

#### combineLatest

```typescript
import { combineLatest } from "@gesturejs/signal";

combineLatest(stream1, stream2).subscribe(([v1, v2]) => {
  console.log(v1, v2);
});
```

### Multicasting

#### share

Share source among subscribers:

```typescript
import { pipe, share } from "@gesturejs/signal";

const shared = pipe(expensiveStream, share());

shared.subscribe(v => console.log("A:", v));
shared.subscribe(v => console.log("B:", v));
```

#### shareReplay

Replay last n values to new subscribers:

```typescript
import { pipe, shareReplay } from "@gesturejs/signal";

const replayed = pipe(source, shareReplay(1));
```

---

## Composing Operators

Use `compose()` to create reusable operator chains:

```typescript
import { compose, filter, map, throttle } from "@gesturejs/signal";

const processNumbers = compose(
  filter((n: number) => n > 0),
  map(n => n * 2),
  throttle(100)
);

// Use it
pipe(source, processNumbers).subscribe(console.log);
```

---

## Subscription

### Function

```typescript
const unsubscribe = source.subscribe(value => {
  console.log(value);
});

unsubscribe();
```

### Observer Object

```typescript
source.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log("done"),
});
```
