// Simple Worker Manager - Žádný Shared State!
import { Worker } from "node:worker_threads";

let workerInstance: Worker | null = null;

// Singleton Worker
export function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL("../workers/message-worker.ts", import.meta.url)
    );
    
    console.log("[Worker Manager] Worker created");
  }
  
  return workerInstance;
}

// Pošli zprávu do Worker a čekej na odpověď
export function processMessage(
  platform: string,
  streamerId: string,
  payload: any
): Promise<any> {
  
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    
    const timeout = setTimeout(() => {
      worker.off("message", handler);
      reject(new Error("Worker timeout"));
    }, 5000);
    
    // Poslouchej odpověď
    const handler = (processed: any) => {
      clearTimeout(timeout);
      worker.off("message", handler);
      resolve(processed);
    };
    
    worker.on("message", handler);
    
    // Pošli do Worker (paralelní zpracování!)
    worker.postMessage({
      platform,
      streamerId,
      ...payload
    });
  });
}





