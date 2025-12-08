import { parentPort, workerData } from "node:worker_threads";
import { randomUUID } from "node:crypto";
import { SharedMessageQueue } from "../lib/queue.ts";
import { Mutex } from "../lib/mutex.ts";
import type { ProducerPayload } from "../types/chat.ts";

type WorkerBootstrap = {
  control: SharedArrayBuffer;
  data: SharedArrayBuffer;
  mutex: SharedArrayBuffer;
  capacity: number;
  slotSize: number;
};

const bootstrap = workerData as WorkerBootstrap;

const queue = new SharedMessageQueue({
  controlBuffer: bootstrap.control,
  dataBuffer: bootstrap.data,
  capacity: bootstrap.capacity,
  slotSize: bootstrap.slotSize,
});

const mutex = new Mutex(bootstrap.mutex);

if (!parentPort) {
  throw new Error("Worker must be started with a parentPort");
}

const port = parentPort;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

port.on("message", async (payload: ProducerPayload & { platform: string }) => {
  // DEBUG LOGGING
  // console.log(`[Unified Worker] Received payload from ${payload.platform} for streamer ${payload.streamerId}`);

  if (!payload.user?.trim() || !payload.text?.trim() || !payload.streamerId) {
    console.warn("[Unified Worker] Invalid payload:", payload);
    return;
  }

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

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      await mutex.acquire(1500);
      try {
        const ok = queue.enqueue(normalized);
        if (!ok) {
          console.warn("[Unified Worker] Queue full, dropping message");
          port.postMessage({ type: "error", message: "Queue full" });
        } else {
          // console.log("[Unified Worker] Enqueued message:", normalized.id);
        }
        return;
      } finally {
        mutex.release();
      }
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error(`[Unified Worker] Failed to lock mutex after ${attempts} attempts. Dropping message.`);
        port.postMessage({ type: "error", message: "Lock timeout" });
      } else {
        await sleep(Math.random() * 50 + 20);
      }
    }
  }
});
