import { WebSocketServer, WebSocket } from "ws";
import { Match } from "../../types";

interface ClientConnection {
  userId: string;
  ws: WebSocket;
}

export class NotificationService {
  private clients: Map<string, ClientConnection> = new Map();
  private wss: WebSocketServer;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const userId = url.searchParams.get("userId");

      if (!userId) {
        ws.close(1008, "Missing userId parameter");
        return;
      }

      this.clients.set(userId, { userId, ws });

      ws.on("close", () => {
        this.clients.delete(userId);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        this.clients.delete(userId);
      });
    });
  }

  public notifyMatch(match: Match): void {
    const user1Connection = this.clients.get(match.user1_id);
    const user2Connection = this.clients.get(match.user2_id);

    const notification = {
      type: "MATCH",
      data: {
        matchId: match.id,
        matchedAt: match.matched_at,
        isSuperLike: match.is_super_like,
      },
    };

    if (user1Connection) {
      this.sendNotification(user1Connection.ws, notification);
    }

    if (user2Connection) {
      this.sendNotification(user2Connection.ws, notification);
    }
  }

  public notifyLike(
    userId: string,
    targetUserId: string,
    isSuperLike: boolean = false
  ): void {
    const targetConnection = this.clients.get(targetUserId);

    if (targetConnection) {
      const notification = {
        type: "LIKE",
        data: {
          fromUserId: userId,
          isSuperLike,
        },
      };

      this.sendNotification(targetConnection.ws, notification);
    }
  }

  private sendNotification(ws: WebSocket, notification: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  }
}

let notificationService: NotificationService | null = null;

export function initializeNotificationService(
  wss: WebSocketServer
): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService(wss);
  }
  return notificationService;
}

export function getNotificationService(): NotificationService | null {
  return notificationService;
}
