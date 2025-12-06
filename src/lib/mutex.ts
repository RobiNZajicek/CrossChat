// =============================================================================
// MUTEX - Zamek pro synchronizaci vlaken
// Pouziva SharedArrayBuffer a Atomics pro thread-safe zamykani
// =============================================================================

// Pomocna funkce - cekani v milisekundach
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class Mutex {
  private readonly buffer: SharedArrayBuffer;
  private readonly stateView: Int32Array;

  // Vytvori novy mutex, nebo pouzije existujici buffer (pro sdileni mezi vlakny)
  constructor(externalBuffer?: SharedArrayBuffer) {
    this.buffer =
      externalBuffer ?? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
    this.stateView = new Int32Array(this.buffer);
  }

  // Getter pro ziskani bufferu - predava se do worker threadu
  get sharedBuffer() {
    return this.buffer;
  }

  // Pokusi se ziskat zamek (acquire lock)
  // Vraci true kdyz uspesne zamkne, haze error po timeoutu
  async acquire(timeoutMs = 5000) {
    const start = Date.now();

    // Fast path - zkusi hned zamknout (0 = volne, 1 = zamknute)
    if (Atomics.compareExchange(this.stateView, 0, 0, 1) === 0) {
      return true;
    }

    // Slow path - ceka az se zamek uvolni
    while (true) {
      // Kontrola timeoutu
      if (Date.now() - start > timeoutMs) {
        throw new Error("Mutex acquisition timed out");
      }

      // Znovu zkusi zamknout
      if (Atomics.compareExchange(this.stateView, 0, 0, 1) === 0) {
        return true;
      }

      // Ceka na uvolneni - waitAsync je lepsi nez busy-wait
      if (typeof Atomics.waitAsync === "function") {
        const result = Atomics.waitAsync(this.stateView, 0, 1, 100);
        await result.value;
      } else {
        await sleep(1); // Fallback pro stare prostredi
      }
    }
  }

  // Uvolni zamek a probudi cekajici vlakna
  release() {
    // Vynuti stav 0 (odemknuto) - bezpecnejsi nez compareExchange
    Atomics.store(this.stateView, 0, 0);
    // Probudi jedno cekajici vlakno
    Atomics.notify(this.stateView, 0, 1);
  }
}
