import type { Server as HTTPServer } from "node:http";
import type { Socket } from "node:net";
import type { Server as IOServer } from "socket.io";
import type { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

