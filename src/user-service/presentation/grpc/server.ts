import * as grpc from "@grpc/grpc-js";
import { container } from "./container";
import { UserGrpcController } from "./UserGrpcController";
import { UserServiceService } from "../../../grpc/proto/user_grpc_pb";

// Servidor gRPC para UserService (DDD)
// IMPORTANT: Use generated service defs so requests are protobuf classes

const PORT = process.env.USER_SERVICE_ADDRESS?.split(":")[1] || "50051";
const HOST = process.env.USER_SERVICE_ADDRESS?.split(":")[0] || "0.0.0.0";

const server = new grpc.Server();

// Resolve dependências do container
const controller = container.get<UserGrpcController>("UserGrpcController");

// Registra o serviço (generated defs)
server.addService(UserServiceService, controller);

server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Failed to start gRPC server:", error);
      process.exit(1);
    }

    console.log(`User Service (DDD) gRPC server running on ${HOST}:${port}`);
  }
);
