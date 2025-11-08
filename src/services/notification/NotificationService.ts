import { WebSocketServer, WebSocket } from "ws";
import { Match } from "../../types";

interface ClientConnection {
  userId: string;
  ws: WebSocket;
}

// Open/Closed: abstrai a classe NotificationHandler para que seja possível adicionar novos tipos de notificações sem modificar a classe NotificationService
export abstract class NotificationHandler {
  abstract handle(
    notification: NotificationData,
    connection: ClientConnection
  ): void;
}

export interface NotificationData {
  type: string;
  data: any;
}

// Implementações concretas - extensíveis sem modificar a classe base
export class MatchNotificationHandler extends NotificationHandler {
  handle(notification: NotificationData, connection: ClientConnection): void {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(notification));
    }
  }
}

export class LikeNotificationHandler extends NotificationHandler {
  handle(notification: NotificationData, connection: ClientConnection): void {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(notification));
    }
  }
}

export class NotificationService {
  private clients: Map<string, ClientConnection> = new Map();
  private wss: WebSocketServer;
  private handlers: Map<string, NotificationHandler> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
    this.registerDefaultHandlers();
  }

  // Open/Closed: pode adicionar novos handlers sem modificar o código existente
  public registerHandler(type: string, handler: NotificationHandler): void {
    this.handlers.set(type, handler);
  }

  private registerDefaultHandlers(): void {
    this.registerHandler("MATCH", new MatchNotificationHandler());
    this.registerHandler("LIKE", new LikeNotificationHandler());
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

    const notification: NotificationData = {
      type: "MATCH",
      data: {
        matchId: match.id,
        matchedAt: match.matched_at,
        isSuperLike: match.is_super_like,
      },
    };

    if (user1Connection) {
      this.sendNotificationWithHandler(notification, user1Connection);
    }

    if (user2Connection) {
      this.sendNotificationWithHandler(notification, user2Connection);
    }
  }

  public notifyLike(
    userId: string,
    targetUserId: string,
    isSuperLike: boolean = false
  ): void {
    const targetConnection = this.clients.get(targetUserId);

    if (targetConnection) {
      const notification: NotificationData = {
        type: "LIKE",
        data: {
          fromUserId: userId,
          isSuperLike,
        },
      };

      this.sendNotificationWithHandler(notification, targetConnection);
    }
  }

  private sendNotificationWithHandler(
    notification: NotificationData,
    connection: ClientConnection
  ): void {
    const handler = this.handlers.get(notification.type);
    if (handler) {
      handler.handle(notification, connection);
    } else {
      // fallback para o comportamento padrão
      this.sendNotification(connection.ws, notification);
    }
  }

  private sendNotification(
    ws: WebSocket,
    notification: NotificationData
  ): void {
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
