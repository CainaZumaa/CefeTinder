import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  } 
});

// Aqui você pode importar e configurar os handlers do WebSocket
import { setupSocketHandlers } from "./setup";
import process from "process";

setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor HTTP+WS na porta ${PORT}`));