import "reflect-metadata";
import * as grpc from "@grpc/grpc-js";

export function startServer(server: grpc.Server, address: string) {
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (error) => {
      if (error) {
        console.error("Error binding server:", error);
        return;
      }
      console.log(`Server running at http://${address}`);
    }
  );
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
