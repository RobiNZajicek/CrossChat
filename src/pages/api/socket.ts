// Socket.IO Server - zprostredkovava real-time komunikaci
// Diky tomuhle lidi vidi zpravy okamzite bez refreshovani stranky

import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import { setSocketIO } from "@/lib/socket-broadcaster";
import type { NextApiResponseServerIO } from "@/types/next";

// Konfigurace - vypneme bodyParser protoze websockety nepotrebujou parsovat JSON
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Handler
 * 
 * Jak to funguje:
 * 1. Klient (browser) se pripoji na /api/socket
 * 2. Server vytvori Socket.IO spojeni
 * 3. Klient se "joini" do roomu sveho streamera
 * 4. Kdyz prijde zprava, broadcaster ji posle vsem v roomu
 * 5. Klienti zpravy dostanou okamzite (bez refreshe!)
 */
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  // Inicializujeme Socket.IO server jenom jednou
  // Pri dalsich requestech pouzijeme existujici instanci
  if (!res.socket.server.io) {
    console.log("[Socket] Inicializuju Socket.IO server...");
    
    // Vytvorime novy server
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",           // URL cesta
      addTrailingSlash: false,
      transports: ["websocket", "polling"], // podporujeme oba typy
      cors: {
        origin: "*",                 // povolime vsechny originy (pro dev)
        methods: ["GET", "POST"],
      },
    });

    // Handler pro nove pripojeni
    io.on("connection", (socket) => {
      console.log(`[Socket] Klient pripojen: ${socket.id}`);
      
      // Kdyz klient chce sledovat nejaky stream, joini se do roomu
      // Room = skupina lidi co sledujou stejnyho streamera
      socket.on("join", (streamerId: string) => {
        const roomName = `streamer:${streamerId}`;
        console.log(`[Socket] ${socket.id} se pridal do ${roomName}`);
        socket.join(roomName);
      });
      
      // Kdyz se klient odpoji
      socket.on("disconnect", () => {
        console.log(`[Socket] Klient odpojen: ${socket.id}`);
      });
    });

    // Ulozime instanci na server objekt (aby prezila requesty)
    res.socket.server.io = io;
    
    // Zaregistrujeme instanci globalne pro broadcaster
    // Diky tomuhle muze broadcaster posilat zpravy z jinych casti aplikace
    setSocketIO(io);
    
    console.log("✅ [Socket] Server inicializovan a zaregistrovan s broadcasterem");
  }

  // Koncime response - websocket uz bezi
  res.end();
}
