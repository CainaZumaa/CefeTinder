import { WebSocketServer, WebSocket } from "ws";
import { RegisterConnectionUseCase } from "../../application/use-cases/RegisterConnectionUseCase";
import { UnregisterConnectionUseCase } from "../../application/use-cases/UnregisterConnectionUseCase";
import { UserId } from "../../domain/value-objects/UserId";

export function setupWebSocketConnections(params: {
  wss: WebSocketServer;
  registerConnection: RegisterConnectionUseCase;
  unregisterConnection: UnregisterConnectionUseCase;
}): void {
  params.wss.on("connection", (ws: WebSocket, req) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const userIdStr = url.searchParams.get("userId");

    if (!userIdStr) {
      console.warn("WebSocket connection rejected: missing userId");
      ws.close(1008, "Missing userId parameter");
      return;
    }

    let userId: UserId;
    try {
      userId = UserId.create(userIdStr);
    } catch {
      console.warn("WebSocket connection rejected: invalid userId", userIdStr);
      ws.close(1008, "Invalid userId parameter");
      return;
    }

    params.registerConnection.execute(userId, ws);
    console.log("WebSocket connected:", userId.toString());

    ws.on("close", () => {
      params.unregisterConnection.execute(userId);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for user ${userId.toString()}:`, error);
      params.unregisterConnection.execute(userId);
    });
  });
}
