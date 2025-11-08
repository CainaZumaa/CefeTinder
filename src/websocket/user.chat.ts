import { io, Socket } from "socket.io-client";
import readline from "readline";

const SERVER_URL = "http://localhost:3000";
const socket: Socket = io(SERVER_URL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentRoom = "";
let isAuthenticated = false;

socket.on("connect", () => {
  console.log(`Conectado como socket ${socket.id}`);
  startAuthentication();
});

socket.on("chat:sys", (msg: string) => {
  console.log(`\x1b[36m[SISTEMA] ${msg}\x1b[0m`);
});

socket.on("chat:msg", (msg: { de: string; texto: string; ts: number; email: string }) => {
  const hora = new Date(msg.ts).toLocaleTimeString();
  console.log(`[${hora}] ${msg.de}: ${msg.texto}`);
});

socket.on("chat:error", (error: string) => {
  console.log(`\x1b[31m[ERRO] ${error}\x1b[0m`);
});

socket.on("disconnect", (reason) => {
  console.log("Desconectado:", reason);
  rl.close();
});

function startAuthentication() {
  rl.question("Seu email: ", (email) => {
    if (!email.trim()) {
      console.log("Email é obrigatório!");
      return startAuthentication();
    }
    
    rl.question("Nome da sala: ", (room) => {
      if (!room.trim()) {
        console.log("Nome da sala é obrigatório!");
        return startAuthentication();
      }
      
      currentRoom = room.trim();
      
      // Entra na sala com o email
      socket.emit("chat:join", room, { email: email.trim() }, (response: any) => {
        if (response && response.error) {
          console.log(`Erro: ${response.error}`);
          startAuthentication();
        } else {
          isAuthenticated = true;
          startChat();
        }
      });
    });
  });
}

function startChat() {
  console.log(`\n=== Chat iniciado na sala '${currentRoom}' ===`);
  console.log("Comandos disponíveis:");
  console.log("  /exit   - Sair do chat");
  console.log("  /ping   - Testar conexão");
  console.log("  /whoami - Ver suas informações");
  console.log("  /help   - Mostrar ajuda\n");

  rl.on("line", (texto) => {
    if (!isAuthenticated) return;

    const command = texto.trim();
    
    if (command === "/exit") {
      console.log("Saindo do chat...");
      socket.disconnect();
      rl.close();
    } else if (command === "/ping") {
      socket.emit("ping:client", "teste", (ack: any) => {
        console.log("Resposta do ping:", ack);
      });
    } else if (command === "/whoami") {
      socket.emit("chat:whoami", (info: any) => {
        console.log("Suas informações:", info);
      });
    } else if (command === "/help") {
      showHelp();
    } else if (command.startsWith("/")) {
      console.log("Comando não reconhecido. Digite /help para ver os comandos disponíveis.");
    } else if (command) {
      socket.emit("chat:msg", { room: currentRoom, texto: command });
    }
  });
}

function showHelp() {
  console.log("\nComandos disponíveis:");
  console.log("  /exit   - Sair do chat");
  console.log("  /ping   - Testar conexão com o servidor");
  console.log("  /whoami - Ver suas informações de conexão");
  console.log("  /help   - Mostrar esta ajuda");
  console.log("  [texto] - Enviar mensagem para a sala\n");
}

// Manipulação graceful de shutdown
process.on('SIGINT', () => {
  console.log("\nSaindo...");
  socket.disconnect();
  rl.close();
  process.exit(0);
});