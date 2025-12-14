import { ConnectionRegistry } from "../ports/ConnectionRegistry";
import { UserId } from "../../domain/value-objects/UserId";
import { WebSocket } from "ws";

export class RegisterConnectionUseCase {
  constructor(private readonly registry: ConnectionRegistry) {}

  execute(userId: UserId, ws: WebSocket): void {
    this.registry.register(userId, ws);
  }
}
