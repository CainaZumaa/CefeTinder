import "dotenv/config";
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
    introspection: true,
  });

  await server.start();

  // GraphQL Playground route
  app.get("/playground", (_, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GraphQL Playground</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
        <link rel="shortcut icon" href="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
        <script src="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
      </head>
      <body>
        <div id="root">
          <style>
            body { margin: 0; font-family: Open Sans, sans-serif; overflow: hidden; }
            #root { height: 100vh; }
          </style>
        </div>
        <script>
          window.addEventListener('load', function (event) {
            GraphQLPlayground.init(document.getElementById('root'), {
              endpoint: '/graphql'
            })
          })
        </script>
      </body>
      </html>
    `);
  });

  // Root route
  app.get("/", (_, res) => {
    res.send(`
      <html>
        <head>
          <title>CEFETinder API</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e91e63; }
            a { color: #2196f3; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .service { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>CEFETinder API</h1>
            <p>Bem-vindo ao CEFETinder! Todos os serviços estão rodando.</p>
            
            <h2>Serviços Disponíveis:</h2>
            <div class="service">
              <strong>GraphQL API:</strong> 
              <a href="/graphql" target="_blank">http://localhost:4000/graphql</a>
              <br><small>Interface para consultas e mutações</small>
            </div>
            
            <div class="service">
              <strong>GraphQL Playground:</strong> 
              <a href="/playground" target="_blank">http://localhost:4000/playground</a>
              <br><small>Interface gráfica para testar queries</small>
            </div>
            
            <div class="service">
              <strong>WebSocket:</strong> 
              <code>ws://localhost:8080</code>
              <br><small>Notificações em tempo real</small>
            </div>
            
            <div class="service">
              <strong>User gRPC Service:</strong> 
              <code>localhost:50051</code>
              <br><small>Gerenciamento de usuários</small>
            </div>
            
            <div class="service">
              <strong>Match gRPC Service:</strong> 
              <code>localhost:50052</code>
              <br><small>Sistema de matching</small>
            </div>
            
            <h2>Como usar:</h2>
            <p>Acesse <a href="/playground">/playground</a> para usar o GraphQL Playground e testar as APIs.</p>
          </div>
        </body>
      </html>
    `);
  });

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
