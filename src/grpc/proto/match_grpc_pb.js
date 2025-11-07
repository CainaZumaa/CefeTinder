// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var match_pb = require('./match_pb.js');

function serialize_match_DislikeUserRequest(arg) {
  if (!(arg instanceof match_pb.DislikeUserRequest)) {
    throw new Error('Expected argument of type match.DislikeUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_match_DislikeUserRequest(buffer_arg) {
  return match_pb.DislikeUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_match_Empty(arg) {
  if (!(arg instanceof match_pb.Empty)) {
    throw new Error('Expected argument of type match.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_match_Empty(buffer_arg) {
  return match_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_match_GetMatchesRequest(arg) {
  if (!(arg instanceof match_pb.GetMatchesRequest)) {
    throw new Error('Expected argument of type match.GetMatchesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_match_GetMatchesRequest(buffer_arg) {
  return match_pb.GetMatchesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_match_LikeUserRequest(arg) {
  if (!(arg instanceof match_pb.LikeUserRequest)) {
    throw new Error('Expected argument of type match.LikeUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_match_LikeUserRequest(buffer_arg) {
  return match_pb.LikeUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_match_Match(arg) {
  if (!(arg instanceof match_pb.Match)) {
    throw new Error('Expected argument of type match.Match');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_match_Match(buffer_arg) {
  return match_pb.Match.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_match_Matches(arg) {
  if (!(arg instanceof match_pb.Matches)) {
    throw new Error('Expected argument of type match.Matches');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_match_Matches(buffer_arg) {
  return match_pb.Matches.deserializeBinary(new Uint8Array(buffer_arg));
}


var MatchServiceService = exports.MatchServiceService = {
  likeUser: {
    path: '/match.MatchService/LikeUser',
    requestStream: false,
    responseStream: false,
    requestType: match_pb.LikeUserRequest,
    responseType: match_pb.Match,
    requestSerialize: serialize_match_LikeUserRequest,
    requestDeserialize: deserialize_match_LikeUserRequest,
    responseSerialize: serialize_match_Match,
    responseDeserialize: deserialize_match_Match,
  },
  dislikeUser: {
    path: '/match.MatchService/DislikeUser',
    requestStream: false,
    responseStream: false,
    requestType: match_pb.DislikeUserRequest,
    responseType: match_pb.Empty,
    requestSerialize: serialize_match_DislikeUserRequest,
    requestDeserialize: deserialize_match_DislikeUserRequest,
    responseSerialize: serialize_match_Empty,
    responseDeserialize: deserialize_match_Empty,
  },
  getMatches: {
    path: '/match.MatchService/GetMatches',
    requestStream: false,
    responseStream: false,
    requestType: match_pb.GetMatchesRequest,
    responseType: match_pb.Matches,
    requestSerialize: serialize_match_GetMatchesRequest,
    requestDeserialize: deserialize_match_GetMatchesRequest,
    responseSerialize: serialize_match_Matches,
    responseDeserialize: deserialize_match_Matches,
  },
};

exports.MatchServiceClient = grpc.makeGenericClientConstructor(MatchServiceService, 'MatchService');
