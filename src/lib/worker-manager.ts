// =============================================================================
// WORKER MANAGER - Sprava Worker Threadu
// Vytvari a udrzuje singleton instanci Unified Workeru
// Posilaji se sem zpravy z API -> Worker je zpracuje -> zapisou do fronty
// =============================================================================

import path from "node:path";
import { Worker } from "node:worker_threads";
import type { ProducerPayload, ProducerPlatform } from "@/types/chat";
import { getSharedState } from "@/lib/shared-state";

// Globalni reference na worker - prezije HMR (hot reload)
const globalWorker = globalThis as typeof globalThis & {
  __crosschat_unified_worker?: Worker;
};

// Vytvori novou instanci workeru
const createUnifiedWorker = () => {
  // Ziskani sdilenych bufferu (mutex, queue)
  const { buffers } = getSharedState();
  
  // Cesta k bootstrap souboru (.js ktery nacte .ts)
  const workerPath = path.resolve(
    process.cwd(),
    "src",
    "workers",
    "unified.worker.js",
  );

  // Vytvoreni workeru s prednymi buffery a TS konfiguraci
  const worker = new Worker(workerPath, {
    workerData: {
      ...buffers,
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

  // Handler pro zpravy z workeru (errory atd)
  worker.on("message", (data) => {
    if (data?.type === "error") {
      console.warn(`[Unified Worker]`, data.message);
    }
  });

  // Handler pro errory workeru
  worker.on("error", (err) => {
    console.error(`[Unified Worker] Error:`, err);
  });

  // Handler pro ukonceni workeru - vynuluje referenci pro restart
  worker.on("exit", (code) => {
    if (code !== 0) {
      console.warn(`[Unified Worker] exited with code ${code}`);
    }
    globalWorker.__crosschat_unified_worker = undefined;
  });

  return worker;
};

// Getter pro worker - vytvori ho pokud neexistuje (lazy init)
const getUnifiedWorker = (): Worker => {
  if (!globalWorker.__crosschat_unified_worker) {
    console.log("[Worker Manager] Spawning Unified Worker...");
    globalWorker.__crosschat_unified_worker = createUnifiedWorker();
  }
  return globalWorker.__crosschat_unified_worker;
};

// Hlavni funkce - posle zpravu do workeru ke zpracovani
// Vola se z API route kdyz uzivatel posle chat zpravu
export const dispatchToWorker = (
  platform: ProducerPlatform,
  payload: ProducerPayload,
) => {
  try {
    const worker = getUnifiedWorker();
    // Posle payload do workeru (platform se prida k payloadu)
    worker.postMessage({ ...payload, platform });
  } catch (error) {
    console.error(`[Worker Manager] Failed to dispatch:`, error);
    // Pri erroru - restartuje worker
    if (globalWorker.__crosschat_unified_worker) {
      globalWorker.__crosschat_unified_worker.terminate();
      globalWorker.__crosschat_unified_worker = undefined;
    }
    throw error;
  }
};
