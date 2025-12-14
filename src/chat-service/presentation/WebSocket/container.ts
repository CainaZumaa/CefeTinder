import { Server } from "socket.io";
import { ChatWebSocketController } from "./ChatWebSocketController";

export class ChatWebSocketContainer {
  static createController(io: Server): ChatWebSocketController {
    return new ChatWebSocketController(io);
  }
}
