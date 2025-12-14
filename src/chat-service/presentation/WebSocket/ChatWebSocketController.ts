import { Server, Socket } from "socket.io";
import { ChatWebSocketMapper } from "./mappers/ChatWebSocketMapper";
import { container as userContainer } from "../../../grpc/user/user.container";
import { UserService } from "../../../services/user/UserService";
import { IUser } from "../../../types";

const userService = userContainer.get<UserService>(UserService);

export class ChatWebSocketController {
  private connectedUsers = new Map<string, IUser>();
  private mapper: ChatWebSocketMapper;

  constructor(private io: Server) {
    this.mapper = new ChatWebSocketMapper();
  }

  public handleConnection(socket: Socket): void {
    console.log("Conectado:", socket.id);

    // Configurar handlers
    this.setupJoinHandler(socket);
    this.setupMessageHandler(socket);
    this.setupPingHandler(socket);
    this.setupWhoAmIHandler(socket);
    this.setupDisconnectHandler(socket);
    this.setupAuthTimeout(socket);
  }

  private setupJoinHandler(socket: Socket): void {
    socket.on(
      "chat:join",
      async (room: string, userData: { email: string }) => {
        try {
          // Validar dados
          const validation = this.mapper.validateJoinRequest(
            room,
            userData.email
          );
          if (!validation.valid) {
            socket.emit("chat:error", validation.error);
            return;
          }

          // Buscar usuário
          const user = await userService.getUserByEmail(userData.email);
          if (!user) {
            socket.emit("chat:error", "Usuário não encontrado");
            return;
          }

          // Processar entrada na sala
          await this.processJoin(socket, room, user);
        } catch (error) {
          console.error("Erro ao entrar na sala:", error);
          socket.emit("chat:error", "Erro interno do servidor");
        }
      }
    );
  }

  private async processJoin(
    socket: Socket,
    room: string,
    user: IUser
  ): Promise<void> {
    // Remover de salas anteriores
    const previousRooms = Array.from(socket.rooms).filter(
      (r) => r !== socket.id
    );
    previousRooms.forEach((prevRoom) => {
      socket.leave(prevRoom);
      socket.to(prevRoom).emit("chat:sys", `${user.name} saiu da sala`);
    });

    // Entrar na nova sala
    this.connectedUsers.set(socket.id, user);
    socket.join(room);

    // Notificações
    socket.to(room).emit("chat:sys", `${user.name} entrou na sala ${room}`);
    socket.emit("chat:sys", `Você entrou na sala "${room}"`);

    console.log(`${user.name} entrou na sala ${room} (Socket: ${socket.id})`);
  }

  private setupMessageHandler(socket: Socket): void {
    socket.on("chat:msg", (data: { room: string; texto: string }) => {
      try {
        const { room, texto } = data;
        const user = this.connectedUsers.get(socket.id);

        // Validar
        const validation = this.mapper.validateMessage(user, room, texto);
        if (!validation.valid) {
          socket.emit("chat:error", validation.error);
          return;
        }

        // Enviar mensagem
        this.broadcastMessage(socket, room, user!, texto.trim());
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        socket.emit("chat:error", "Erro ao enviar mensagem");
      }
    });
  }

  private broadcastMessage(
    socket: Socket,
    room: string,
    user: IUser,
    texto: string
  ): void {
    this.io.to(room).emit("chat:msg", {
      de: user.name,
      email: user.email,
      texto,
      ts: Date.now(),
    });

    console.log(`[${room}] ${user.name}: ${texto}`);
  }

  private setupPingHandler(socket: Socket): void {
    socket.on("ping:client", (msg: string, ack?: Function) => {
      if (ack) {
        ack({
          ok: true,
          echo: msg,
          now: Date.now(),
          socketId: socket.id,
        });
      }
    });
  }

  private setupWhoAmIHandler(socket: Socket): void {
    socket.on("chat:whoami", (ack?: Function) => {
      if (ack) {
        const user = this.connectedUsers.get(socket.id);
        ack({
          user: user
            ? {
                name: user.name,
                email: user.email,
                id: user.id,
              }
            : null,
          socketId: socket.id,
          rooms: Array.from(socket.rooms).filter((room) => room !== socket.id),
        });
      }
    });
  }

  private setupDisconnectHandler(socket: Socket): void {
    socket.on("disconnect", (reason) => {
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        console.log(`${user.name} saiu (${reason})`);

        // Notificar todas as salas
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.to(room).emit("chat:sys", `${user.name} saiu da sala`);
          }
        });
      }
      this.connectedUsers.delete(socket.id);
    });
  }

  private setupAuthTimeout(socket: Socket): void {
    setTimeout(() => {
      if (!this.connectedUsers.has(socket.id)) {
        socket.emit("chat:error", "Tempo limite de autenticação excedido");
        socket.disconnect();
      }
    }, 30000);
  }
}
