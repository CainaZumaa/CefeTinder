import "reflect-metadata";
import { spawn } from "child_process";
import path from "path";

console.log("🚀 Starting CEFETinder Gateway...\n");

// Start all microservices
const services = [
  {
    name: "User Service (gRPC)",
    script: path.join(__dirname, "../grpc/user/user.server.ts"),
    color: "\x1b[36m", // Cyan
  },
  {
    name: "Match Service (gRPC)",
    script: path.join(__dirname, "../grpc/match/match.server.ts"),
    color: "\x1b[35m", // Magenta
  },
  {
    name: "GraphQL Server",
    script: path.join(__dirname, "../graphql/server.ts"),
    color: "\x1b[32m", // Green
  },
  {
    name: "WebSocket/Notification Service",
    script: path.join(__dirname, "../websocket/server.ts"),
    color: "\x1b[33m", // Yellow
  },
];

const processes: any[] = [];

services.forEach((service) => {
  console.log(`Starting ${service.name}...`);

  const proc = spawn("npx", ["ts-node", service.script], {
    stdio: "pipe",
    shell: true,
    env: { ...process.env },
  });

  proc.stdout.on("data", (data: Buffer) => {
    console.log(
      `${service.color}[${service.name}]\x1b[0m ${data.toString().trim()}`
    );
  });

  proc.stderr.on("data", (data: Buffer) => {
    console.error(
      `${service.color}[${service.name} ERROR]\x1b[0m ${data.toString().trim()}`
    );
  });

  proc.on("close", (code: number) => {
    console.log(
      `${service.color}[${service.name}]\x1b[0m Process exited with code ${code}`
    );
  });

  processes.push(proc);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down all services...");
  processes.forEach((proc) => proc.kill());
  process.exit(0);
});

console.log("\n✅ All services started!");
console.log("📝 Press Ctrl+C to stop all services\n");
