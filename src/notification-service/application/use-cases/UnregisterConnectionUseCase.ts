import { ConnectionRegistry } from "../ports/ConnectionRegistry";
import { UserId } from "../../domain/value-objects/UserId";

export class UnregisterConnectionUseCase {
  constructor(private readonly registry: ConnectionRegistry) {}

  execute(userId: UserId): void {
    this.registry.unregister(userId);
  }
}
