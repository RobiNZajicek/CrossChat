import path from "node:path";
import { Worker } from "node:worker_threads";
import type { ProducerPayload, ProducerPlatform } from "@/types/chat";
import { getSharedState } from "@/lib/shared-state";

// Singleton Worker Instance
const globalWorker = globalThis as typeof globalThis & {
  __crosschat_unified_worker?: Worker;
};

const createUnifiedWorker = () => {
  const { buffers } = getSharedState();
  const workerPath = path.resolve(
    process.cwd(),
    "src",
    "workers",
    "unified.worker.js", // Points to the new unified worker
  );

  const worker = new Worker(workerPath, {
    workerData: {
      ...buffers,
      // No specific platform needed in bootstrap, it's dynamic
    },
    execArgv: [
      "-r",
      "ts-node/register/transpile-only",
      "-r",
      "tsconfig-paths/register",
    ],
    env: {
      ...process.env,
      TS_NODE_PROJECT: path.resolve(process.cwd(), "tsconfig.worker.json"),
    },
  });

  worker.on("message", (data) => {
    if (data?.type === "error") {
      console.warn(`[Unified Worker]`, data.message);
    }
  });

  worker.on("error", (err) => {
    console.error(`[Unified Worker] Error:`, err);
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.warn(`[Unified Worker] exited with code ${code}`);
    }
    globalWorker.__crosschat_unified_worker = undefined;
  });

  return worker;
};

const getUnifiedWorker = (): Worker => {
  if (!globalWorker.__crosschat_unified_worker) {
    console.log("[Worker Manager] Spawning Unified Worker...");
    globalWorker.__crosschat_unified_worker = createUnifiedWorker();
  }
  return globalWorker.__crosschat_unified_worker;
};

export const dispatchToWorker = (
  platform: ProducerPlatform, // Still passed for compatibility
  payload: ProducerPayload,
) => {
  try {
    const worker = getUnifiedWorker();
    // Inject platform into the payload for the unified worker
    worker.postMessage({ ...payload, platform });
  } catch (error) {
    console.error(`[Worker Manager] Failed to dispatch:`, error);
    // Force restart
    if (globalWorker.__crosschat_unified_worker) {
        globalWorker.__crosschat_unified_worker.terminate();
        globalWorker.__crosschat_unified_worker = undefined;
    }
    throw error;
  }
};
