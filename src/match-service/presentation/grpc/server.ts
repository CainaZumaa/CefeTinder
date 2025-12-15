import * as grpc from "@grpc/grpc-js";
import { buildMatchContainer } from "../../config/container";
import { MatchServiceService } from "../../../grpc/proto/match_grpc_pb";

const PORT = process.env.MATCH_SERVICE_ADDRESS?.split(":")[1] || "50052";
const HOST = process.env.MATCH_SERVICE_ADDRESS?.split(":")[0] || "0.0.0.0";

const server = new grpc.Server();

const { controller } = buildMatchContainer();

server.addService(MatchServiceService, controller);

server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Failed to start gRPC server:", error);
      process.exit(1);
    }

    console.log(`Match Service gRPC server running on ${HOST}:${port}`);
  }
);
