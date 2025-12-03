import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { container } from "./container";
import { UserGrpcController } from "./UserGrpcController";
import path from "path";

// Servidor gRPC para UserService
// Camada de Presentation

const PROTO_PATH = path.join(__dirname, "../../../grpc/proto/user.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition) as any;

const PORT = process.env.USER_SERVICE_ADDRESS?.split(":")[1] || "50051";
const HOST = process.env.USER_SERVICE_ADDRESS?.split(":")[0] || "0.0.0.0";

const server = new grpc.Server();

// Resolve dependências do container
const controller = container.get<UserGrpcController>("UserGrpcController");

// Registra o serviço
server.addService(userProto.user.UserService.service, controller);

// Inicia o servidor
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
