import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { IUser } from "../types/index";
import { getUserByEmail } from "../services/user";

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

const connectedUsers = new Map<string, IUser>();

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  socket.on("chat:join", async (room: string, userData: { email: string }) => {
    try {
      if (!room || !userData.email) {
        socket.emit("chat:error", "Dados inválidos para entrar na sala");
        return;
      }

      if (room.length > 50) {
        socket.emit("chat:error", "Nome da sala muito longo");
        return;
      }

      const user = await getUserByEmail(userData.email);
      
      if (!user) {
        socket.emit("chat:error", "Usuário não encontrado");
        return;
      }

      // Remove o usuário de salas anteriores (se houver)
      const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      previousRooms.forEach(prevRoom => {
        socket.leave(prevRoom);
        socket.to(prevRoom).emit("chat:sys", `${user.name} saiu da sala`);
      });

      // Entra na nova sala
      connectedUsers.set(socket.id, user);
      socket.join(room);
      
      // Notifica os outros usuários na sala
      socket.to(room).emit("chat:sys", `${user.name} entrou na sala ${room}`);
      
      // Notifica o próprio usuário
      socket.emit("chat:sys", `Você entrou na sala "${room}"`);
      
      console.log(`${user.name} entrou na sala ${room} (Socket: ${socket.id})`);
      
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      socket.emit("chat:error", "Erro interno do servidor");
    }
  });

  socket.on("chat:msg", ({ room, texto }: { room: string; texto: string }) => {
    try {
      const user = connectedUsers.get(socket.id);
      
      if (!user) {
        socket.emit("chat:error", "Você precisa entrar em uma sala primeiro");
        return;
      }

      if (!room) {
        socket.emit("chat:error", "Sala não especificada");
        return;
      }

      // Valida a mensagem
      const mensagemTrimmed = texto.trim();
      if (!mensagemTrimmed) {
        return; 
      }

      if (mensagemTrimmed.length > 1000) {
        socket.emit("chat:error", "Mensagem muito longa (máximo 1000 caracteres)");
        return;
      }

      // Verifica se o usuário está na sala
      if (!socket.rooms.has(room)) {
        socket.emit("chat:error", "Você não está nesta sala");
        return;
      }

      // Envia a mensagem para todos na sala
      io.to(room).emit("chat:msg", {
        de: user.name,
        email: user.email, 
        texto: mensagemTrimmed,
        ts: Date.now(),
      });

      console.log(`[${room}] ${user.name}: ${mensagemTrimmed}`);
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      socket.emit("chat:error", "Erro ao enviar mensagem");
    }
  });

  socket.on("ping:client", (msg: string, ack?: Function) => {
    if (ack) {
      ack({ 
        ok: true, 
        echo: msg, 
        now: Date.now(),
        socketId: socket.id 
      });
    }
  });

  socket.on("chat:whoami", (ack?: Function) => {
    const user = connectedUsers.get(socket.id);
    if (ack) {
      ack({
        user: user ? { 
          name: user.name, 
          email: user.email,
          id: user.id 
        } : null,
        socketId: socket.id,
        rooms: Array.from(socket.rooms).filter(room => room !== socket.id)
      });
    }
  });

  socket.on("disconnect", (reason) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.name} saiu (${reason})`);
      
      // Notifica todas as salas que o usuário estava
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit("chat:sys", `${user.name} saiu da sala`);
        }
      });
    }
    connectedUsers.delete(socket.id);
  });

  // Timeout para usuários que não fazem autenticação
  setTimeout(() => {
    if (!connectedUsers.has(socket.id)) {
      socket.emit("chat:error", "Tempo limite de autenticação excedido");
      socket.disconnect();
    }
  }, 30000);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor HTTP+WS na porta ${PORT}`));