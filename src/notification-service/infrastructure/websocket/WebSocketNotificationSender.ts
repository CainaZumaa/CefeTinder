import { WebSocket } from "ws";
import { Notification } from "../../domain/entities/Notification";
import { NotificationSender } from "../../application/ports/NotificationSender";
import { ConnectionRegistry } from "../../application/ports/ConnectionRegistry";

export class WebSocketNotificationSender implements NotificationSender {
  constructor(private readonly registry: ConnectionRegistry) {}

  send(notification: Notification): void {
    let delivered = 0;
    for (const recipient of notification.recipients) {
      const ws = this.registry.get(recipient);
      if (!ws) continue;
      if (ws.readyState !== WebSocket.OPEN) continue;

      ws.send(
        JSON.stringify({
          type: notification.type,
          data: notification.payload,
        })
      );
      delivered++;
    }

    console.log(
      `[WS] notification ${notification.type} recipients=${notification.recipients.length} delivered=${delivered}`
    );
  }
}
