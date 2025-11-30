const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class Mutex {
  private readonly buffer: SharedArrayBuffer;
  private readonly stateView: Int32Array;

  constructor(externalBuffer?: SharedArrayBuffer) {
    this.buffer =
      externalBuffer ?? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
    this.stateView = new Int32Array(this.buffer);
  }

  get sharedBuffer() {
    return this.buffer;
  }

  async acquire(timeoutMs = 5000) {
    const start = Date.now();

    // Fast path
    if (Atomics.compareExchange(this.stateView, 0, 0, 1) === 0) {
      return true;
    }

    // Slow path with timeout
    while (true) {
      if (Date.now() - start > timeoutMs) {
        throw new Error("Mutex acquisition timed out");
      }

      if (Atomics.compareExchange(this.stateView, 0, 0, 1) === 0) {
        return true;
      }

      if (typeof Atomics.waitAsync === "function") {
        const result = Atomics.waitAsync(this.stateView, 0, 1, 100); // 100ms timeout for wait
        await result.value;
      } else {
        await sleep(1); // Busy wait fallback
      }
    }
  }

  release() {
    // We use exchange instead of compareExchange for robustness:
    // even if it was messed up, we force it to 0 (unlocked).
    // The previous check was too strict for a demo app and could cause deadlock if a worker crashed holding the lock.
    Atomics.store(this.stateView, 0, 0);
    Atomics.notify(this.stateView, 0, 1);
  }
}
