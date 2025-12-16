import { WebSocketServer, WebSocket } from "ws";
import { setupWebSocketHandlers } from "./setup";


const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (ws: WebSocket) => {
  const clientId = Math.random().toString(36).substring(7);
  
  console.log(`Cliente conectado: ${clientId}`);
  
  // Envia mensagem de boas-vindas
  ws.send(JSON.stringify({
    type: "welcome",
    clientId,
    timestamp: new Date().toISOString()
  }));
  
  ws.on("message", (data: Buffer) => {
      try {
      const message = JSON.parse(data.toString());
      console.log(` Mensagem de ${clientId}:`, message);
      
      // Ecoa a mensagem de volta
      ws.send(JSON.stringify({
          type: "echo",
        original: message,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // Se não for JSON, trata como texto simples
      const text = data.toString();
      console.log(`Texto de ${clientId}: ${text}`);
      
      ws.send(`Recebido: "${text}"`);
    }
  });
  
  ws.on("close", () => {
      console.log(` Cliente desconectado: ${clientId}`);
  });
  
  ws.on("error", (error) => {
      console.error(` Erro no cliente ${clientId}:`, error);
    });
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n Finalizando servidor...");
  wss.close(() => {
      console.log("Servidor finalizado");
      process.exit(0);
    });
});

setupWebSocketHandlers(wss);