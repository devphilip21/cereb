/**
 * Signal Pool Benchmark
 *
 * Measures memory usage and GC impact of Signal Pool vs direct object creation.
 * Run with: npm run benchmark:pool
 *
 * Requires Node.js with --expose-gc flag for accurate GC measurements.
 */

interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

interface BenchmarkResult {
  scenario: string;
  usePool: boolean;
  iterations: number;
  heapUsedStart: number;
  heapUsedEnd: number;
  heapUsedDelta: number;
  heapUsedPeak: number;
  totalTimeMs: number;
  opsPerSec: number;
  gcCountEstimate: number;
}

// Simulated SinglePointer value structure (matches the actual implementation)
interface SinglePointer {
  phase: string;
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  pointerType: string;
  button: string;
  pressure: number;
  id: string;
}

interface Signal<K = string, V = unknown> {
  kind: K;
  value: V;
  deviceId: string;
  createdAt: number;
  updatedAt?: number;
}

function createDefaultSinglePointerValue(): SinglePointer {
  return {
    phase: "unknown",
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
    pointerType: "unknown",
    button: "none",
    pressure: 0,
    id: "",
  };
}

function resetSinglePointerValue(value: SinglePointer): void {
  value.phase = "unknown";
  value.x = 0;
  value.y = 0;
  value.pageX = 0;
  value.pageY = 0;
  value.pointerType = "unknown";
  value.button = "none";
  value.pressure = 0;
  value.id = "";
}

// Simple object pool implementation for benchmarking
class SimpleSignalPool {
  private pool: Signal<"single-pointer", SinglePointer>[] = [];
  private maxSize: number;

  constructor(initialSize: number, maxSize: number) {
    this.maxSize = maxSize;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createSignal());
    }
  }

  private createSignal(): Signal<"single-pointer", SinglePointer> {
    return {
      kind: "single-pointer",
      value: createDefaultSinglePointerValue(),
      deviceId: "benchmark-device",
      createdAt: performance.now(),
    };
  }

  acquire(): Signal<"single-pointer", SinglePointer> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createSignal();
  }

  release(signal: Signal<"single-pointer", SinglePointer>): void {
    if (this.pool.length < this.maxSize) {
      signal.deviceId = "benchmark-device";
      signal.createdAt = performance.now();
      signal.updatedAt = undefined;
      resetSinglePointerValue(signal.value);
      this.pool.push(signal);
    }
  }

  get size(): number {
    return this.pool.length;
  }
}

function getMemorySnapshot(): MemorySnapshot {
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    arrayBuffers: mem.arrayBuffers,
  };
}

function forceGC(): void {
  const gc = (globalThis as typeof globalThis & { gc?: () => void }).gc;
  if (gc) {
    gc();
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

async function runScenario(
  name: string,
  iterations: number,
  usePool: boolean,
  burstMode: boolean = false,
): Promise<BenchmarkResult> {
  // Force GC before starting
  forceGC();
  await new Promise((r) => setTimeout(r, 100));

  const pool = usePool ? new SimpleSignalPool(20, 100) : null;
  const startMem = getMemorySnapshot();
  let peakHeapUsed = startMem.heapUsed;
  let gcCount = 0;

  // Track heap growth to estimate GC events
  let lastHeapUsed = startMem.heapUsed;

  const startTime = performance.now();

  if (burstMode) {
    // Burst mode: create many signals at once, then release
    const signals: Signal<"single-pointer", SinglePointer>[] = [];

    for (let i = 0; i < iterations; i++) {
      let signal: Signal<"single-pointer", SinglePointer>;

      if (usePool && pool) {
        signal = pool.acquire();
      } else {
        signal = {
          kind: "single-pointer",
          value: createDefaultSinglePointerValue(),
          deviceId: "benchmark-device",
          createdAt: performance.now(),
        };
      }

      // Simulate usage
      signal.value.x = Math.random() * 1000;
      signal.value.y = Math.random() * 1000;
      signal.value.phase = "move";

      signals.push(signal);

      // Check memory periodically
      if (i % 1000 === 0) {
        const currentMem = getMemorySnapshot();
        if (currentMem.heapUsed > peakHeapUsed) {
          peakHeapUsed = currentMem.heapUsed;
        }
        // Estimate GC by detecting heap drops
        if (currentMem.heapUsed < lastHeapUsed - 1024 * 1024) {
          gcCount++;
        }
        lastHeapUsed = currentMem.heapUsed;
      }
    }

    // Release all
    if (usePool && pool) {
      for (const signal of signals) {
        pool.release(signal);
      }
    }
  } else {
    // Normal mode: acquire, use, release immediately
    for (let i = 0; i < iterations; i++) {
      let signal: Signal<"single-pointer", SinglePointer>;

      if (usePool && pool) {
        signal = pool.acquire();
      } else {
        signal = {
          kind: "single-pointer",
          value: createDefaultSinglePointerValue(),
          deviceId: "benchmark-device",
          createdAt: performance.now(),
        };
      }

      // Simulate usage
      signal.value.x = Math.random() * 1000;
      signal.value.y = Math.random() * 1000;
      signal.value.phase = "move";

      if (usePool && pool) {
        pool.release(signal);
      }

      // Check memory periodically
      if (i % 10000 === 0) {
        const currentMem = getMemorySnapshot();
        if (currentMem.heapUsed > peakHeapUsed) {
          peakHeapUsed = currentMem.heapUsed;
        }
        if (currentMem.heapUsed < lastHeapUsed - 1024 * 1024) {
          gcCount++;
        }
        lastHeapUsed = currentMem.heapUsed;
      }
    }
  }

  const endTime = performance.now();
  const totalTimeMs = endTime - startTime;

  // Force GC and measure final state
  forceGC();
  await new Promise((r) => setTimeout(r, 100));
  const endMem = getMemorySnapshot();

  return {
    scenario: name,
    usePool,
    iterations,
    heapUsedStart: startMem.heapUsed,
    heapUsedEnd: endMem.heapUsed,
    heapUsedDelta: endMem.heapUsed - startMem.heapUsed,
    heapUsedPeak: peakHeapUsed,
    totalTimeMs,
    opsPerSec: Math.round(iterations / (totalTimeMs / 1000)),
    gcCountEstimate: gcCount,
  };
}

function printResult(result: BenchmarkResult): void {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📊 ${result.scenario}`);
  console.log(`   Pool: ${result.usePool ? "✅ Enabled" : "❌ Disabled"}`);
  console.log(`${"─".repeat(60)}`);
  console.log(`   Iterations:      ${formatNumber(result.iterations)}`);
  console.log(`   Total Time:      ${result.totalTimeMs.toFixed(2)} ms`);
  console.log(`   Ops/sec:         ${formatNumber(result.opsPerSec)}`);
  console.log(`   Heap Start:      ${formatBytes(result.heapUsedStart)}`);
  console.log(`   Heap End:        ${formatBytes(result.heapUsedEnd)}`);
  console.log(`   Heap Delta:      ${formatBytes(result.heapUsedDelta)}`);
  console.log(`   Heap Peak:       ${formatBytes(result.heapUsedPeak)}`);
  console.log(`   Est. GC Events:  ${result.gcCountEstimate}`);
}

function printComparison(poolResult: BenchmarkResult, noPoolResult: BenchmarkResult): void {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`📈 Comparison: ${poolResult.scenario}`);
  console.log(`${"═".repeat(60)}`);

  const speedDiff =
    ((poolResult.opsPerSec - noPoolResult.opsPerSec) / noPoolResult.opsPerSec) * 100;
  const memDiff =
    ((noPoolResult.heapUsedPeak - poolResult.heapUsedPeak) / noPoolResult.heapUsedPeak) * 100;

  console.log(`\n   Speed:`);
  console.log(`     Pool:    ${formatNumber(poolResult.opsPerSec)} ops/sec`);
  console.log(`     No Pool: ${formatNumber(noPoolResult.opsPerSec)} ops/sec`);
  console.log(
    `     Diff:    ${speedDiff > 0 ? "+" : ""}${speedDiff.toFixed(1)}% ${speedDiff > 0 ? "faster" : "slower"}`,
  );

  console.log(`\n   Peak Memory:`);
  console.log(`     Pool:    ${formatBytes(poolResult.heapUsedPeak)}`);
  console.log(`     No Pool: ${formatBytes(noPoolResult.heapUsedPeak)}`);
  console.log(
    `     Saved:   ${formatBytes(noPoolResult.heapUsedPeak - poolResult.heapUsedPeak)} (${memDiff.toFixed(1)}%)`,
  );

  console.log(`\n   Est. GC Events:`);
  console.log(`     Pool:    ${poolResult.gcCountEstimate}`);
  console.log(`     No Pool: ${noPoolResult.gcCountEstimate}`);
}

async function main(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           Signal Pool Memory Benchmark                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  if (!(globalThis as typeof globalThis & { gc?: () => void }).gc) {
    console.log("\n⚠️  Warning: Run with --expose-gc for accurate GC measurements");
    console.log("   Example: node --expose-gc dist/benchmarks/signal-pool.bench.js\n");
  }

  // Warm up
  console.log("\n🔥 Warming up...");
  await runScenario("Warmup", 10000, true, false);
  await runScenario("Warmup", 10000, false, false);

  // Scenario 1: High frequency pointer events (60fps for 1 minute = 3600 signals)
  console.log("\n\n📌 Scenario 1: High Frequency (60fps simulation)");
  const highFreqPool = await runScenario("High Frequency (3,600 signals)", 3600, true, false);
  const highFreqNoPool = await runScenario("High Frequency (3,600 signals)", 3600, false, false);
  printResult(highFreqPool);
  printResult(highFreqNoPool);
  printComparison(highFreqPool, highFreqNoPool);

  // Scenario 2: Burst events (1000/sec burst)
  console.log("\n\n📌 Scenario 2: Burst Events");
  const burstPool = await runScenario("Burst (10,000 signals)", 10000, true, true);
  const burstNoPool = await runScenario("Burst (10,000 signals)", 10000, false, true);
  printResult(burstPool);
  printResult(burstNoPool);
  printComparison(burstPool, burstNoPool);

  // Scenario 3: Long duration (simulating 10 minutes at 60fps = 36000 signals)
  console.log("\n\n📌 Scenario 3: Long Duration");
  const longPool = await runScenario("Long Duration (36,000 signals)", 36000, true, false);
  const longNoPool = await runScenario("Long Duration (36,000 signals)", 36000, false, false);
  printResult(longPool);
  printResult(longNoPool);
  printComparison(longPool, longNoPool);

  // Scenario 4: Extreme load
  console.log("\n\n📌 Scenario 4: Extreme Load");
  const extremePool = await runScenario("Extreme (100,000 signals)", 100000, true, false);
  const extremeNoPool = await runScenario("Extreme (100,000 signals)", 100000, false, false);
  printResult(extremePool);
  printResult(extremeNoPool);
  printComparison(extremePool, extremeNoPool);

  // Summary
  console.log("\n\n" + "═".repeat(60));
  console.log("📋 SUMMARY");
  console.log("═".repeat(60));
  console.log("\nPool is beneficial when:");
  console.log("  - High frequency events with immediate release pattern");
  console.log("  - Memory constrained environments");
  console.log("  - Long-running applications");
  console.log("\nPool may not help when:");
  console.log("  - Burst patterns where many signals are held simultaneously");
  console.log("  - Low frequency events");
  console.log("  - Short-lived applications");
  console.log("\n" + "═".repeat(60));
}

main().catch(console.error);
