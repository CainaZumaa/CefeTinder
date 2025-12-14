import { WebSocket } from "ws";
import { UserId } from "../../domain/value-objects/UserId";

export interface ConnectionRegistry {
  register(userId: UserId, ws: WebSocket): void;
  unregister(userId: UserId): void;
  get(userId: UserId): WebSocket | undefined;
}
