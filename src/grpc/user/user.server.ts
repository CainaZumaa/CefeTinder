import * as grpc from "@grpc/grpc-js";
import { startServer } from "../lib/start-server";
import { UserServiceService } from "../proto/user_grpc_pb";
import { userServiceImplementation } from "./user.implementation";

const server = new grpc.Server(); 

server.addService(UserServiceService, userServiceImplementation);

startServer(server, process.env.USER_SERVICE_ADDRESS || "127.0.0.1:50051");
