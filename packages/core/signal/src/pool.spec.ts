import { describe, it, expect, vi } from "vitest";
import { createSignalPool } from "./pool.js";
import type { Signal } from "./signal.js";

interface TestSignal extends Signal<"test"> {
  type: "test";
  value: number;
}

describe("createSignalPool", () => {
  const factory = (): TestSignal => ({
    type: "test",
    timestamp: 0,
    deviceId: "",
    value: 0,
  });
  const reset = (obj: TestSignal) => {
    obj.timestamp = 0;
    obj.deviceId = "";
    obj.value = 0;
  };

  it("should pre-allocate objects on creation", () => {
    const pool = createSignalPool(factory, reset, 5);

    expect(pool.size).toBe(5);
    expect(pool.active).toBe(0);
  });

  it("should return object from pool on acquire", () => {
    const pool = createSignalPool(factory, reset, 3);

    const obj = pool.acquire();

    expect(obj.type).toBe("test");
    expect(obj.value).toBe(0);
    expect(pool.size).toBe(2);
    expect(pool.active).toBe(1);
  });

  it("should create new object when pool is empty", () => {
    const factorySpy = vi.fn(factory);
    const pool = createSignalPool(factorySpy, reset, 1);

    pool.acquire();
    pool.acquire();

    expect(factorySpy).toHaveBeenCalledTimes(2);
  });

  it("should reset and return object to pool on release", () => {
    const pool = createSignalPool(factory, reset, 1);

    const obj = pool.acquire();
    obj.value = 42;
    obj.deviceId = "device-1";
    pool.release(obj);

    expect(obj.value).toBe(0);
    expect(obj.deviceId).toBe("");
    expect(pool.size).toBe(1);
    expect(pool.active).toBe(0);
  });

  it("should not exceed maxSize on release", () => {
    const pool = createSignalPool(factory, reset, 0, 2);

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire();

    pool.release(obj1);
    pool.release(obj2);
    pool.release(obj3);

    expect(pool.size).toBe(2);
  });

  it("should clear all pooled objects", () => {
    const pool = createSignalPool(factory, reset, 5);

    pool.acquire();
    pool.clear();

    expect(pool.size).toBe(0);
    expect(pool.active).toBe(0);
  });
});
