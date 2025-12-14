import { MatchService } from "../../services/match/MatchService";
import { IMatchServiceServer } from "../proto/match_grpc_pb";
import {
  DislikeUserRequest,
  Empty,
  GetMatchesRequest,
  LikeUserRequest,
  Match,
  Matches,
} from "../proto/match_pb";
import * as grpc from "@grpc/grpc-js";
import { RabbitMQMatchEventsPublisher } from "../../messaging/MatchEventsPublisher";

const rabbitUrl = process.env.RABBITMQ_URL;
const eventsPublisher = rabbitUrl
  ? new RabbitMQMatchEventsPublisher(rabbitUrl)
  : undefined;

const service = new MatchService(eventsPublisher);

export const matchServiceImplementation: IMatchServiceServer = {
  getMatches: async (
    call: grpc.ServerUnaryCall<GetMatchesRequest, Matches>,
    callback: grpc.sendUnaryData<Matches>
  ) => {
    const userId = call.request.getUserid();

    try {
      const matchList = await service.getMatches(userId);
      const protoMatches = matchList.map((match) => {
        const protoMatch = new Match();
        protoMatch.setId(match.id);
        protoMatch.setUser1id(match.user1_id);
        protoMatch.setUser2id(match.user2_id);
        protoMatch.setUser1liked(match.user1_liked);
        protoMatch.setUser2liked(match.user2_liked);
        protoMatch.setIssuperlike(match.is_super_like);
        protoMatch.setMatchedat(
          match.matched_at ? match.matched_at.toISOString() : ""
        );
        protoMatch.setCreatedat(
          match.created_at
            ? match.created_at.toISOString()
            : new Date().toISOString()
        );
        protoMatch.setUpdatedat(
          match.updated_at
            ? match.updated_at.toISOString()
            : new Date().toISOString()
        );
        return protoMatch;
      });
      callback(null, new Matches().setMatchesList(protoMatches));
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  likeUser: async (
    call: grpc.ServerUnaryCall<LikeUserRequest, Match>,
    callback: grpc.sendUnaryData<Match>
  ) => {
    const userId = call.request.getUserid();
    const likedUserId = call.request.getTargetuserid();

    try {
      const isSuperLike = call.request.getIsmatchlike();
      const match = await service.likeUser(userId, likedUserId, isSuperLike);
      if (!match) {
        callback(null, null);
        return;
      }
      const protoMatch = new Match();
      protoMatch.setId(match.id);
      protoMatch.setUser1id(match.user1_id);
      protoMatch.setUser2id(match.user2_id);
      protoMatch.setUser1liked(match.user1_liked);
      protoMatch.setUser2liked(match.user2_liked);
      protoMatch.setIssuperlike(match.is_super_like);
      protoMatch.setMatchedat(
        match.matched_at ? match.matched_at.toISOString() : ""
      );
      protoMatch.setCreatedat(
        match.created_at
          ? match.created_at.toISOString()
          : new Date().toISOString()
      );
      protoMatch.setUpdatedat(
        match.updated_at
          ? match.updated_at.toISOString()
          : new Date().toISOString()
      );
      callback(null, protoMatch);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },

  dislikeUser: async (
    call: grpc.ServerUnaryCall<DislikeUserRequest, Empty>,
    callback: grpc.sendUnaryData<Empty>
  ) => {
    const userId = call.request.getUserid();
    const dislikedUserId = call.request.getTargetuserid();

    try {
      await service.dislikeUser(userId, dislikedUserId);
      callback(null, new Empty());
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
};
