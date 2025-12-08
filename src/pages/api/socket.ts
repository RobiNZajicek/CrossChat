import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import { getSharedState } from "@/lib/shared-state";
import { saveMessage } from "@/lib/db";
import type { NextApiResponseServerIO } from "@/types/next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const globalLoop = globalThis as typeof globalThis & {
  __crosschat_interval?: NodeJS.Timeout;
};

const startPump = (io: IOServer) => {
  if (globalLoop.__crosschat_interval) {
    return;
  }

  console.log("[Socket] Starting routing pump...");
  const { queue, mutex } = getSharedState();

  const pump = async () => {
    try {
      await mutex.acquire();
      try {
        let message = queue.dequeue();
        let count = 0;
        
        while (message && count < 50) {
          // Debug logs to verify data flow
          // console.log(`[Socket Pump] Message ${message.id} for ${message.streamerId}`);

          if (message.streamerId) {
            const roomName = `streamer:${message.streamerId}`;
            
            // 1. Send to specific room (Primary)
            io.to(roomName).emit("chat:message", message);
            
            // 2. Broadcast with a special flag (Fallback for debugging)
            // If rooms are failing, the client will still get this but filter it
            io.emit("chat:message:global", message); 
          }
          
          saveMessage(message);
          
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

  globalLoop.__crosschat_interval = setInterval(pump, 50);
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
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

    io.on("connection", (socket) => {
        socket.on("join", (streamerId: string) => {
            const roomName = `streamer:${streamerId}`;
            console.log(`[Socket] ${socket.id} joined ${roomName}`);
            socket.join(roomName);
        });
    });

    res.socket.server.io = io;
  }

  // Ensure pump is running
  if (res.socket.server.io) {
    startPump(res.socket.server.io);
  }

  res.end();
}
