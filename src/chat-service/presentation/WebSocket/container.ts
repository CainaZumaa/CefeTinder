import { Server } from "socket.io";
import { ChatWebSocketController } from "./controllers/ChatWebSocketController";
import { ChatWebSocketMapper } from "./mappers/ChatWebSocketMapper";

export class ChatWebSocketContainer {
  static createController(io: Server): ChatWebSocketController {
    const mapper = new ChatWebSocketMapper();
    return new ChatWebSocketController(io, mapper);
  }
}