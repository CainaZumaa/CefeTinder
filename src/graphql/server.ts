import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import express from "express";
import http from "http";
import cors from "cors";
import { createSchema } from "./schema";
import { expressMiddleware } from "@as-integrations/express5";

async function createServer() {
  const app = express();

  const httpServer = http.createServer(app);

  const schema = await createSchema();

  const server = new ApolloServer({
    schema,
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server)
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );

  console.log(`🚀  Server ready at: http://localhost:4000`);
}

createServer().catch((error) => {
  console.error("Error starting server:", error);
});
