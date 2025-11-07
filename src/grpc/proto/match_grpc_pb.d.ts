// package: match
// file: match.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as match_pb from "./match_pb";

interface IMatchServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    likeUser: IMatchServiceService_ILikeUser;
    dislikeUser: IMatchServiceService_IDislikeUser;
    getMatches: IMatchServiceService_IGetMatches;
}

interface IMatchServiceService_ILikeUser extends grpc.MethodDefinition<match_pb.LikeUserRequest, match_pb.Match> {
    path: "/match.MatchService/LikeUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<match_pb.LikeUserRequest>;
    requestDeserialize: grpc.deserialize<match_pb.LikeUserRequest>;
    responseSerialize: grpc.serialize<match_pb.Match>;
    responseDeserialize: grpc.deserialize<match_pb.Match>;
}
interface IMatchServiceService_IDislikeUser extends grpc.MethodDefinition<match_pb.DislikeUserRequest, match_pb.Empty> {
    path: "/match.MatchService/DislikeUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<match_pb.DislikeUserRequest>;
    requestDeserialize: grpc.deserialize<match_pb.DislikeUserRequest>;
    responseSerialize: grpc.serialize<match_pb.Empty>;
    responseDeserialize: grpc.deserialize<match_pb.Empty>;
}
interface IMatchServiceService_IGetMatches extends grpc.MethodDefinition<match_pb.GetMatchesRequest, match_pb.Matches> {
    path: "/match.MatchService/GetMatches";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<match_pb.GetMatchesRequest>;
    requestDeserialize: grpc.deserialize<match_pb.GetMatchesRequest>;
    responseSerialize: grpc.serialize<match_pb.Matches>;
    responseDeserialize: grpc.deserialize<match_pb.Matches>;
}

export const MatchServiceService: IMatchServiceService;

export interface IMatchServiceServer extends grpc.UntypedServiceImplementation {
    likeUser: grpc.handleUnaryCall<match_pb.LikeUserRequest, match_pb.Match>;
    dislikeUser: grpc.handleUnaryCall<match_pb.DislikeUserRequest, match_pb.Empty>;
    getMatches: grpc.handleUnaryCall<match_pb.GetMatchesRequest, match_pb.Matches>;
}

export interface IMatchServiceClient {
    likeUser(request: match_pb.LikeUserRequest, callback: (error: grpc.ServiceError | null, response: match_pb.Match) => void): grpc.ClientUnaryCall;
    likeUser(request: match_pb.LikeUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: match_pb.Match) => void): grpc.ClientUnaryCall;
    likeUser(request: match_pb.LikeUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: match_pb.Match) => void): grpc.ClientUnaryCall;
    dislikeUser(request: match_pb.DislikeUserRequest, callback: (error: grpc.ServiceError | null, response: match_pb.Empty) => void): grpc.ClientUnaryCall;
    dislikeUser(request: match_pb.DislikeUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: match_pb.Empty) => void): grpc.ClientUnaryCall;
    dislikeUser(request: match_pb.DislikeUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: match_pb.Empty) => void): grpc.ClientUnaryCall;
    getMatches(request: match_pb.GetMatchesRequest, callback: (error: grpc.ServiceError | null, response: match_pb.Matches) => void): grpc.ClientUnaryCall;
    getMatches(request: match_pb.GetMatchesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: match_pb.Matches) => void): grpc.ClientUnaryCall;
    getMatches(request: match_pb.GetMatchesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: match_pb.Matches) => void): grpc.ClientUnaryCall;
}

export class MatchServiceClient extends grpc.Client implements IMatchServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public likeUser(request: match_pb.LikeUserRequest, callback: (error: grpc.ServiceError | null, response: match_pb.Match) => void): grpc.ClientUnaryCall;
    public likeUser(request: match_pb.LikeUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: match_pb.Match) => void): grpc.ClientUnaryCall;
    public likeUser(request: match_pb.LikeUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: match_pb.Match) => void): grpc.ClientUnaryCall;
    public dislikeUser(request: match_pb.DislikeUserRequest, callback: (error: grpc.ServiceError | null, response: match_pb.Empty) => void): grpc.ClientUnaryCall;
    public dislikeUser(request: match_pb.DislikeUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: match_pb.Empty) => void): grpc.ClientUnaryCall;
    public dislikeUser(request: match_pb.DislikeUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: match_pb.Empty) => void): grpc.ClientUnaryCall;
    public getMatches(request: match_pb.GetMatchesRequest, callback: (error: grpc.ServiceError | null, response: match_pb.Matches) => void): grpc.ClientUnaryCall;
    public getMatches(request: match_pb.GetMatchesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: match_pb.Matches) => void): grpc.ClientUnaryCall;
    public getMatches(request: match_pb.GetMatchesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: match_pb.Matches) => void): grpc.ClientUnaryCall;
}
