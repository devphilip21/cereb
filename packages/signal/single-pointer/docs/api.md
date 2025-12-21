# API Reference

## Factory

```typescript
import { singlePointer } from "@gesturejs/single-pointer";

const stream = singlePointer(element, options?);
```

### Options

```typescript
interface SinglePointerOptions {
  deviceId?: string;
  pooling?: boolean;
  listenerOptions?: AddEventListenerOptions;
}
```

## Use another events instead of pointer

```typescript
import { touchEventsToSinglePointer } from "@gesturejs/single-pointer";
import { fromTouchEvents, pipe } from "@gesturejs/stream";

const stream = pipe(
  fromTouchEvents(el),
  touchEventsToSinglePointer()
);
```

```typescript
import { mouseEventsToSinglePointer } from "@gesturejs/single-pointer";
import { fromMouseEvents, pipe } from "@gesturejs/stream";

const stream = pipe(
  fromMouseEvents(el),
  mouseEventsToSinglePointer()
);
```

---

## Emitter

For manual event handling.

```typescript
import { createPointerEmitter } from "@gesturejs/single-pointer";
import { createTouchEmitter } from "@gesturejs/single-pointer";
import { createMouseEmitter } from "@gesturejs/single-pointer";
```

```typescript
import { createPointerEmitter } from "@gesturejs/single-pointer";

const emitter = createPointerEmitter({ pooling: true });

element.addEventListener("pointerdown", (e) => {
  const pointer = emitter.process(e);
  if (pointer) {
    console.log(pointer.x, pointer.y);
  }
});

emitter.dispose();
```

## Pooling

When `pooling: true`, objects are reused to reduce GC pressure. The emitter automatically releases the previous pointer when a new event arrives. No manual release is required.

**Warning**: Do not store pointer references outside the callback. They will be reused on the next event.
