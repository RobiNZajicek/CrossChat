// Simple Message Worker - Žádný Shared Memory!
import { parentPort } from "node:worker_threads";
import { randomUUID } from "node:crypto";

type IncomingMessage = {
  platform: string;
  streamerId: string;
  user: string;
  text: string;
  isVip?: boolean;
  isSub?: boolean;
  isMod?: boolean;
  color?: string;
};

type ProcessedMessage = IncomingMessage & {
  id: string;
  timestamp: number;
};

if (!parentPort) {
  throw new Error("Worker must have parentPort");
}

console.log("[Worker] Message processor ready");

// Poslouchej zprávy z Main Thread
parentPort.on("message", (msg: IncomingMessage) => {
  
  // Validace
  if (!msg.user?.trim() || !msg.text?.trim() || !msg.streamerId) {
    console.warn("[Worker] Invalid message:", msg);
    return;
  }
  
  // Normalizace (paralelně v Worker Thread!)
  const processed: ProcessedMessage = {
    ...msg,
    id: randomUUID(),
    timestamp: Date.now(),
    user: msg.user.trim(),
    text: msg.text.trim()
  };
  
  // Pošli ZPÁTKY do Main Thread
  parentPort!.postMessage(processed);
});





