import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { MatchResolver } from "./resolvers/MatchResolver";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { initializeNotificationService } from "../services/notification/NotificationService";

async function bootstrap() {
  const app: Application = express();

  // graphql Schema
  const schema = await buildSchema({
    resolvers: [UserResolver, MatchResolver],
    validate: false,
  });

  // apollo Server
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  await apolloServer.applyMiddleware({
    app: app as any,
    cors: {
      origin: true,
      credentials: true,
    },
  });

  // HTTP server
  const httpServer = createServer(app);

  // inicializacão do servidor WebSocket p/ notificações
  const wss = new WebSocketServer({ server: httpServer });
  initializeNotificationService(wss);

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Servidor GraphQL rodando em http://localhost:${PORT}/graphql`);
    console.log(`Servidor WebSocket rodando em ws://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);
