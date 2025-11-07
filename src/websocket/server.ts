import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import {
  getNotificationService,
  initializeNotificationService,
} from "../services/notification/NotificationService";

const app = express();

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

initializeNotificationService(wss);

const notificationService = getNotificationService()!;

app.post("/notify/like", (req, res) => {
  const { match } = req.body;
  if (!match) {
    return res.status(400).send("Missing match data");
  }

  notificationService.notifyLike(
    match.user1_id,
    match.user2_id,
    match.is_super_like
  );

  return res.status(200).send("Like notification sent");
});

app.post("/notify/match", (req, res) => {
  const { match } = req.body;
  if (!match) {
    return res.status(400).send("Missing match data");
  }

  notificationService.notifyMatch(match);

  return res.status(200).send("Match notification sent");
});

const PORT = process.env.WEBSOCKET_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
