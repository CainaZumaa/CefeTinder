import "dotenv/config";
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

import {
  InMemoryConnectionRegistry,
  WebSocketNotificationSender,
  RegisterConnectionUseCase,
  UnregisterConnectionUseCase,
  NotifyLikeUseCase,
  NotifyMatchUseCase,
  createNotificationRouter,
  setupWebSocketConnections,
} from "../notification-service";

import { startNotificationsConsumer } from "../notification-service/infrastructure/rabbitmq/startNotificationsConsumer";

const app = express();

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Composition root (Clean Architecture): wire ports/adapters/use-cases
const connectionRegistry = new InMemoryConnectionRegistry();
const sender = new WebSocketNotificationSender(connectionRegistry);

const registerConnection = new RegisterConnectionUseCase(connectionRegistry);
const unregisterConnection = new UnregisterConnectionUseCase(
  connectionRegistry
);

const notifyLike = new NotifyLikeUseCase(sender);
const notifyMatch = new NotifyMatchUseCase(sender);

const rabbitUrl = process.env.RABBITMQ_URL;
if (rabbitUrl) {
  startNotificationsConsumer({
    rabbitUrl,
    notifyLike,
    notifyMatch,
  }).catch((err) => {
    console.error("Failed to start RabbitMQ notifications consumer:", err);
  });
} else {
  console.warn("RABBITMQ_URL is not set. Notifications consumer is disabled.");
}

setupWebSocketConnections({
  wss,
  registerConnection,
  unregisterConnection,
});

app.use(
  createNotificationRouter({
    notifyLike,
    notifyMatch,
  })
);

const PORT = process.env.WEBSOCKET_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
