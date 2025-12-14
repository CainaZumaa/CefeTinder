import "dotenv/config";
import * as grpc from '@grpc/grpc-js';
import { MatchServiceService } from '../proto/match_grpc_pb';
import { matchServiceImplementation } from './match.implementation';
import { startServer } from '../lib/start-server';

const server = new grpc.Server();

server.addService(MatchServiceService, matchServiceImplementation);


startServer(server, process.env.MATCH_SERVICE_ADDRESS || "127.0.0.1:50052");