// =============================================================================
// SOCKET.IO SERVER - WebSocket endpoint pro real-time komunikaci
// Inicializuje Socket.IO server a spousti "pump" pro vybirani zprav z fronty
// Zpravy se posilaji do "rooms" podle streamerId
// =============================================================================

import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import { getSharedState } from "@/lib/shared-state";
import { saveMessage } from "@/lib/db";
import type { NextApiResponseServerIO } from "@/types/next";

// Vypnuti body parseru - Socket.IO ma vlastni protokol
export const config = {
  api: {
    bodyParser: false,
  },
};

// Globalni reference na pump interval - prezije HMR
const globalLoop = globalThis as typeof globalThis & {
  __crosschat_interval?: NodeJS.Timeout;
};

// =============================================================================
// MESSAGE PUMP - Vybira zpravy z fronty a posilna klientum
// =============================================================================

const startPump = (io: IOServer) => {
  // Pump uz bezi - nespoustet znovu
  if (globalLoop.__crosschat_interval) {
    return;
  }

  console.log("[Socket] Starting routing pump...");
  const { queue, mutex } = getSharedState();

  // Pump funkce - bezi kazdych 50ms
  const pump = async () => {
    try {
      // Ziskani zamku pro cteni z fronty
      await mutex.acquire();
      try {
        let message = queue.dequeue();
        let count = 0;
        
        // Vybere max 50 zprav za jeden cyklus
        while (message && count < 50) {
          if (message.streamerId) {
            const roomName = `streamer:${message.streamerId}`;
            
            // Posle zpravu do specificke "room" (jen klientum tohoto streamera)
            io.to(roomName).emit("chat:message", message);
            
            // Fallback broadcast - pro debugging kdyz rooms nefunguji
            io.emit("chat:message:global", message); 
          }
          
          // Ulozi zpravu do souboru (persistence)
          saveMessage(message);
          
          // Dalsi zprava
          message = queue.dequeue();
          count++;
        }
      } finally {
        mutex.release();
      }
    } catch (err) {
      console.error("[Socket] Pump error:", err);
    }
  };

  // Spusteni pumpy - kazdych 50ms vybere zpravy z fronty
  globalLoop.__crosschat_interval = setInterval(pump, 50);
};

// =============================================================================
// HANDLER - Hlavni endpoint pro WebSocket pripojeni
// =============================================================================

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  // Inicializace Socket.IO serveru (jen jednou)
  if (!res.socket.server.io) {
    console.log("[Socket] Initializing Socket.IO server...");
    
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Handler pro nove pripojeni klienta
    io.on("connection", (socket) => {
      // Klient posle "join" event s ID streamera -> pripojime ho do room
      socket.on("join", (streamerId: string) => {
        const roomName = `streamer:${streamerId}`;
        console.log(`[Socket] ${socket.id} joined ${roomName}`);
        socket.join(roomName);
      });
    });

    res.socket.server.io = io;
  }

  // Spusteni pumpy (pokud jeste nebezi)
  if (res.socket.server.io) {
    startPump(res.socket.server.io);
  }

  res.end();
}
