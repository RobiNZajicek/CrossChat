import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseServerIO } from "@/types/next";
import type { ChatMessage } from "@/types/chat";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Global Socket.IO instance (persists across hot reloads)
const globalIO = globalThis as typeof globalThis & {
  __crosschat_io?: IOServer;
};

/**
 * SIMPLE Socket.IO Handler
 * 
 * Odpovědnost: Robin
 * 
 * Ultra-simple Socket.IO bez queue/mutex!
 * Zprávy jsou broadcastovány PŘÍMO z producer handler.
 */
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log("[Socket] Initializing Socket.IO server...");
    
    const io = new IOServer(res.socket.server, {
      path: "/api/simple-socket",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`);
      
      socket.on("join", (streamerId: string) => {
        const roomName = `streamer:${streamerId}`;
        console.log(`[Socket] ${socket.id} joined ${roomName}`);
        socket.join(roomName);
      });
      
      socket.on("disconnect", () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      });
    });

    res.socket.server.io = io;
    globalIO.__crosschat_io = io;
    
    console.log("✅ [Socket] Server initialized");
  }

  res.end();
}

/**
 * Broadcast message to all clients in streamer room
 * Called from simple-producer-handler.ts
 */
export function broadcastMessage(message: ChatMessage) {
  const io = globalIO.__crosschat_io;
  
  if (!io) {
    console.warn("[Socket] Cannot broadcast - Socket.IO not initialized");
    return;
  }
  
  const roomName = `streamer:${message.streamerId}`;
  
  // Send to specific room
  io.to(roomName).emit("chat:message", message);
  
  // Also emit globally (fallback)
  io.emit("chat:message:global", message);
  
  console.log(`[Socket] Broadcasted message to ${roomName}:`, {
    user: message.user,
    text: message.text.substring(0, 30)
  });
}
