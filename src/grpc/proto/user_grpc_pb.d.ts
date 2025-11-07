// package: user
// file: user.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as user_pb from "./user_pb";

interface IUserServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getUser: IUserServiceService_IGetUser;
    createUser: IUserServiceService_ICreateUser;
    getPotentialMatches: IUserServiceService_IGetPotentialMatches;
    updateUserPreferences: IUserServiceService_IUpdateUserPreferences;
}

interface IUserServiceService_IGetUser extends grpc.MethodDefinition<user_pb.GetUserRequest, user_pb.User> {
    path: "/user.UserService/GetUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.GetUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.GetUserRequest>;
    responseSerialize: grpc.serialize<user_pb.User>;
    responseDeserialize: grpc.deserialize<user_pb.User>;
}
interface IUserServiceService_ICreateUser extends grpc.MethodDefinition<user_pb.CreateUserRequest, user_pb.User> {
    path: "/user.UserService/CreateUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.CreateUserRequest>;
    requestDeserialize: grpc.deserialize<user_pb.CreateUserRequest>;
    responseSerialize: grpc.serialize<user_pb.User>;
    responseDeserialize: grpc.deserialize<user_pb.User>;
}
interface IUserServiceService_IGetPotentialMatches extends grpc.MethodDefinition<user_pb.MatchCriteria, user_pb.PotentialMatches> {
    path: "/user.UserService/GetPotentialMatches";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.MatchCriteria>;
    requestDeserialize: grpc.deserialize<user_pb.MatchCriteria>;
    responseSerialize: grpc.serialize<user_pb.PotentialMatches>;
    responseDeserialize: grpc.deserialize<user_pb.PotentialMatches>;
}
interface IUserServiceService_IUpdateUserPreferences extends grpc.MethodDefinition<user_pb.UpdatePreferencesRequest, user_pb.User> {
    path: "/user.UserService/UpdateUserPreferences";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<user_pb.UpdatePreferencesRequest>;
    requestDeserialize: grpc.deserialize<user_pb.UpdatePreferencesRequest>;
    responseSerialize: grpc.serialize<user_pb.User>;
    responseDeserialize: grpc.deserialize<user_pb.User>;
}

export const UserServiceService: IUserServiceService;

export interface IUserServiceServer extends grpc.UntypedServiceImplementation {
    getUser: grpc.handleUnaryCall<user_pb.GetUserRequest, user_pb.User>;
    createUser: grpc.handleUnaryCall<user_pb.CreateUserRequest, user_pb.User>;
    getPotentialMatches: grpc.handleUnaryCall<user_pb.MatchCriteria, user_pb.PotentialMatches>;
    updateUserPreferences: grpc.handleUnaryCall<user_pb.UpdatePreferencesRequest, user_pb.User>;
}

export interface IUserServiceClient {
    getUser(request: user_pb.GetUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    getPotentialMatches(request: user_pb.MatchCriteria, callback: (error: grpc.ServiceError | null, response: user_pb.PotentialMatches) => void): grpc.ClientUnaryCall;
    getPotentialMatches(request: user_pb.MatchCriteria, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.PotentialMatches) => void): grpc.ClientUnaryCall;
    getPotentialMatches(request: user_pb.MatchCriteria, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.PotentialMatches) => void): grpc.ClientUnaryCall;
    updateUserPreferences(request: user_pb.UpdatePreferencesRequest, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    updateUserPreferences(request: user_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    updateUserPreferences(request: user_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
}

export class UserServiceClient extends grpc.Client implements IUserServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public getUser(request: user_pb.GetUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public getUser(request: user_pb.GetUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public createUser(request: user_pb.CreateUserRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public getPotentialMatches(request: user_pb.MatchCriteria, callback: (error: grpc.ServiceError | null, response: user_pb.PotentialMatches) => void): grpc.ClientUnaryCall;
    public getPotentialMatches(request: user_pb.MatchCriteria, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.PotentialMatches) => void): grpc.ClientUnaryCall;
    public getPotentialMatches(request: user_pb.MatchCriteria, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.PotentialMatches) => void): grpc.ClientUnaryCall;
    public updateUserPreferences(request: user_pb.UpdatePreferencesRequest, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public updateUserPreferences(request: user_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
    public updateUserPreferences(request: user_pb.UpdatePreferencesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: user_pb.User) => void): grpc.ClientUnaryCall;
}
