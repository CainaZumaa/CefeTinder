import { Server, Socket } from "socket.io";
import { ChatWebSocketController } from "./ChatWebSocketController";

export function setupSocketHandlers(io: Server): void {
  const controller = new ChatWebSocketController(io);
  
  io.on("connection", (socket: Socket) => {
    controller.handleConnection(socket);
  });
}