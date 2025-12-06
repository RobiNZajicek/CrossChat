// =============================================================================
// UNIFIED WORKER - Hlavni worker thread pro zpracovani zprav
// Prijima zpravy z API, normalizuje je a zapisuje do sdilene fronty
// Bezi v samostatnem vlakne = neblokuje hlavni server
// =============================================================================

import { parentPort, workerData } from "node:worker_threads";
import { randomUUID } from "node:crypto";
import { SharedMessageQueue } from "../lib/queue.ts";
import { Mutex } from "../lib/mutex.ts";
import type { ProducerPayload } from "../types/chat.ts";

// Typ pro data predana z hlavniho vlakna
type WorkerBootstrap = {
  control: SharedArrayBuffer;   // Ridici buffer fronty
  data: SharedArrayBuffer;      // Datovy buffer fronty
  mutex: SharedArrayBuffer;     // Sdileny mutex
  capacity: number;
  slotSize: number;
};

// Rekonstrukce sdilenych objektu z predanych bufferu
const bootstrap = workerData as WorkerBootstrap;

const queue = new SharedMessageQueue({
  controlBuffer: bootstrap.control,
  dataBuffer: bootstrap.data,
  capacity: bootstrap.capacity,
  slotSize: bootstrap.slotSize,
});

const mutex = new Mutex(bootstrap.mutex);

// Kontrola ze mame parentPort (komunikace s hlavnim vlaknem)
if (!parentPort) {
  throw new Error("Worker must be started with a parentPort");
}

const port = parentPort;

// Pomocna funkce pro cekani
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// MESSAGE HANDLER - Zpracovani prichozich zprav
// =============================================================================

port.on("message", async (payload: ProducerPayload & { platform: string }) => {
  // Validace payloadu
  if (!payload.user?.trim() || !payload.text?.trim() || !payload.streamerId) {
    console.warn("[Unified Worker] Invalid payload:", payload);
    return;
  }

  // Normalizace zpravy - pridani ID, timestamp atd
  const normalized = {
    id: randomUUID(),
    streamerId: payload.streamerId,
    user: payload.user.trim(),
    text: payload.text.trim(),
    platform: payload.platform,
    timestamp: Date.now(),
    isVip: payload.isVip,
    isSub: payload.isSub,
    isMod: payload.isMod,
    color: payload.color,
  };

  // Retry logika s exponencialnim backoffem
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      // Ziskani zamku (kriticka sekce)
      await mutex.acquire(1500);
      try {
        // Zapis do fronty
        const ok = queue.enqueue(normalized);
        if (!ok) {
          console.warn("[Unified Worker] Queue full, dropping message");
          port.postMessage({ type: "error", message: "Queue full" });
        }
        return; // Uspech - konec
      } finally {
        // Vzdy uvolnit zamek!
        mutex.release();
      }
    } catch (err) {
      // Zamek se nepodarilo ziskat - zkusime znovu
      attempts++;
      if (attempts >= maxAttempts) {
        console.error(`[Unified Worker] Failed to lock mutex after ${attempts} attempts. Dropping message.`);
        port.postMessage({ type: "error", message: "Lock timeout" });
      } else {
        // Random delay pred dalsim pokusem (aby se vlakna nepotkavaly)
        await sleep(Math.random() * 50 + 20);
      }
    }
  }
});
