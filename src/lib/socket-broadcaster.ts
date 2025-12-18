// Socket.IO Broadcaster - posila zpravy vsem pripojenym klientum v realnem case
// 
// Jak to funguje:
// 1. Nekdo posle zpravu pres API
// 2. Tahle funkce ji posle vsem kdo koukaji na stream
// 3. Vsichni vidi zpravu OKAMZITE (bez refreshe stranky)

import { Server as IOServer } from "socket.io";
import type { ChatMessage } from "@/types/chat";

// Globalni Socket.IO instance - musi prezit hot reload
// Jinak by se spojeni porad prerusovalo a lidi by museli refreshovat
const globalSocket = globalThis as typeof globalThis & {
  __crosschat_io?: IOServer;
};

/**
 * Nastavi Socket.IO server instanci
 * Vola se ze socket.ts kdyz se server inicializuje
 */
export function setSocketIO(io: IOServer) {
  globalSocket.__crosschat_io = io;
  console.log("[Socket Broadcaster] IO instance nastavena");
}

/**
 * Vrati Socket.IO server instanci
 * Muze byt undefined kdyz jeste neni inicializovana
 */
export function getSocketIO(): IOServer | undefined {
  return globalSocket.__crosschat_io;
}

/**
 * HLAVNI FUNKCE - posle zpravu vsem v roomu streamera
 * 
 * Room = skupina lidi co koukaji na stejny stream
 * Kazdy streamer ma svuj room (streamer:abc123)
 * 
 * Vola se z producer handleru kdyz prijde nova zprava
 */
export function broadcastMessage(message: ChatMessage) {
  const io = globalSocket.__crosschat_io;
  
  // Jeste neni inicializovano? Nevadi, zprava se ulozi, jenom nebude realtime
  if (!io) {
    console.warn("[Socket Broadcaster] Nemuzeme broadcastovat - Socket.IO jeste neni ready");
    console.warn("[Socket Broadcaster] Zprava se ulozi, ale lidi ji uvidi az po refreshi");
    return false;
  }
  
  // Jmeno roomu - kazdy streamer ma svuj
  const roomName = `streamer:${message.streamerId}`;
  const clientCount = io.engine?.clientsCount || 0;
  
  console.log(`[Socket Broadcaster] Broadcastuju:`, {
    room: roomName,
    user: message.user,
    text: message.text.substring(0, 30), // jenom prvnich 30 znaku do logu
    platform: message.platform,
    connectedClients: clientCount
  });
  
  // Posleme do roomu streamera (hlavni metoda)
  io.to(roomName).emit("chat:message", message);
  
  // Taky posleme globalne (backup, pro debugovani)
  io.emit("chat:message:global", message);
  
  console.log(`✅ [Socket Broadcaster] Eventy odeslany`);
  
  return true;
}

/**
 * Posle event vsem pripojenym klientum
 * Pouziva se treba pro system notifikace
 */
export function broadcastToAll(event: string, data: any) {
  const io = globalSocket.__crosschat_io;
  
  if (!io) {
    console.warn("[Socket Broadcaster] Nemuzeme broadcastovat - Socket.IO neni inicializovano");
    return false;
  }
  
  io.emit(event, data);
  return true;
}

/**
 * Vrati kolik lidi je prave pripojeno
 * Pro statistiky a debugovani
 */
export function getConnectedClients(): number {
  const io = globalSocket.__crosschat_io;
  return io?.engine?.clientsCount || 0;
}
