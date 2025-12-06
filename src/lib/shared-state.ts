// =============================================================================
// SHARED STATE - Globalni sdileny stav aplikace
// Singleton pattern - drzi referenci na frontu a mutex
// Prezije HMR (hot module reload) diky globalThis
// =============================================================================

import { Mutex } from "@/lib/mutex";
import { SharedMessageQueue } from "@/lib/queue";

// Typ pro vsechny sdilene zdroje
type SharedResources = {
  queue: SharedMessageQueue;   // Fronta zprav
  mutex: Mutex;                // Zamek pro synchronizaci
  buffers: {                   // Raw buffery pro worker thready
    control: SharedArrayBuffer;
    data: SharedArrayBuffer;
    mutex: SharedArrayBuffer;
    capacity: number;
    slotSize: number;
  };
};

// Globalni reference - prezije restary serveru a HMR
const globalState = globalThis as typeof globalThis & {
  __crosschat_state?: SharedResources;
};

// Vytvori novy sdileny stav (fronta + mutex)
const createState = (): SharedResources => {
  const queue = new SharedMessageQueue({
    capacity: 256,   // Max 256 zprav ve fronte
    slotSize: 4096,  // Max 4KB na zpravu
  });

  const mutex = new Mutex();

  return {
    queue,
    mutex,
    buffers: {
      control: queue.buffers.control,
      data: queue.buffers.data,
      mutex: mutex.sharedBuffer,
      capacity: queue.capacity,
      slotSize: queue.slotSize,
    },
  };
};

// Getter pro sdileny stav - vytvori ho pokud neexistuje (lazy init)
// Pouziva se v hlavnim vlakne (socket pump) i ve worker manageru
export const getSharedState = (): SharedResources => {
  if (!globalState.__crosschat_state) {
    globalState.__crosschat_state = createState();
  }
  return globalState.__crosschat_state;
};
