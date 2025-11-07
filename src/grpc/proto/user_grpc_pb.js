// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var user_pb = require('./user_pb.js');

function serialize_user_CreateUserRequest(arg) {
  if (!(arg instanceof user_pb.CreateUserRequest)) {
    throw new Error('Expected argument of type user.CreateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_CreateUserRequest(buffer_arg) {
  return user_pb.CreateUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_GetUserRequest(arg) {
  if (!(arg instanceof user_pb.GetUserRequest)) {
    throw new Error('Expected argument of type user.GetUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_GetUserRequest(buffer_arg) {
  return user_pb.GetUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_MatchCriteria(arg) {
  if (!(arg instanceof user_pb.MatchCriteria)) {
    throw new Error('Expected argument of type user.MatchCriteria');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_MatchCriteria(buffer_arg) {
  return user_pb.MatchCriteria.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_PotentialMatches(arg) {
  if (!(arg instanceof user_pb.PotentialMatches)) {
    throw new Error('Expected argument of type user.PotentialMatches');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_PotentialMatches(buffer_arg) {
  return user_pb.PotentialMatches.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UpdatePreferencesRequest(arg) {
  if (!(arg instanceof user_pb.UpdatePreferencesRequest)) {
    throw new Error('Expected argument of type user.UpdatePreferencesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UpdatePreferencesRequest(buffer_arg) {
  return user_pb.UpdatePreferencesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_User(arg) {
  if (!(arg instanceof user_pb.User)) {
    throw new Error('Expected argument of type user.User');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_User(buffer_arg) {
  return user_pb.User.deserializeBinary(new Uint8Array(buffer_arg));
}


var UserServiceService = exports.UserServiceService = {
  getUser: {
    path: '/user.UserService/GetUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.GetUserRequest,
    responseType: user_pb.User,
    requestSerialize: serialize_user_GetUserRequest,
    requestDeserialize: deserialize_user_GetUserRequest,
    responseSerialize: serialize_user_User,
    responseDeserialize: deserialize_user_User,
  },
  createUser: {
    path: '/user.UserService/CreateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.CreateUserRequest,
    responseType: user_pb.User,
    requestSerialize: serialize_user_CreateUserRequest,
    requestDeserialize: deserialize_user_CreateUserRequest,
    responseSerialize: serialize_user_User,
    responseDeserialize: deserialize_user_User,
  },
  getPotentialMatches: {
    path: '/user.UserService/GetPotentialMatches',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.MatchCriteria,
    responseType: user_pb.PotentialMatches,
    requestSerialize: serialize_user_MatchCriteria,
    requestDeserialize: deserialize_user_MatchCriteria,
    responseSerialize: serialize_user_PotentialMatches,
    responseDeserialize: deserialize_user_PotentialMatches,
  },
  updateUserPreferences: {
    path: '/user.UserService/UpdateUserPreferences',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UpdatePreferencesRequest,
    responseType: user_pb.User,
    requestSerialize: serialize_user_UpdatePreferencesRequest,
    requestDeserialize: deserialize_user_UpdatePreferencesRequest,
    responseSerialize: serialize_user_User,
    responseDeserialize: deserialize_user_User,
  },
};

exports.UserServiceClient = grpc.makeGenericClientConstructor(UserServiceService, 'UserService');
