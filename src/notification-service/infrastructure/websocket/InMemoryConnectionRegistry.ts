import { WebSocket } from "ws";
import { ConnectionRegistry } from "../../application/ports/ConnectionRegistry";
import { UserId } from "../../domain/value-objects/UserId";

export class InMemoryConnectionRegistry implements ConnectionRegistry {
  private readonly clients = new Map<string, WebSocket>();

  register(userId: UserId, ws: WebSocket): void {
    this.clients.set(userId.toString(), ws);
  }

  unregister(userId: UserId): void {
    this.clients.delete(userId.toString());
  }

  get(userId: UserId): WebSocket | undefined {
    return this.clients.get(userId.toString());
  }
}
