import * as grpc from "@grpc/grpc-js";
import { IMatchServiceServer } from "../../../grpc/proto/match_grpc_pb";
import {
  DislikeUserRequest,
  Empty,
  GetMatchesRequest,
  LikeUserRequest,
  Match,
  Matches,
} from "../../../grpc/proto/match_pb";
import { LikeUserUseCase } from "../../application/use-cases/LikeUserUseCase";
import { DislikeUserUseCase } from "../../application/use-cases/DislikeUserUseCase";
import { GetMatchesUseCase } from "../../application/use-cases/GetMatchesUseCase";
import { MatchGrpcMapper } from "./mappers/MatchGrpcMapper";

export class MatchGrpcController implements IMatchServiceServer {
  [key: string]: any;

  constructor(
    private readonly likeUserUseCase: LikeUserUseCase,
    private readonly dislikeUserUseCase: DislikeUserUseCase,
    private readonly getMatchesUseCase: GetMatchesUseCase
  ) {}

  async getMatches(
    call: grpc.ServerUnaryCall<GetMatchesRequest, Matches>,
    callback: grpc.sendUnaryData<Matches>
  ): Promise<void> {
    try {
      const userId = call.request.getUserid();
      const matches = await this.getMatchesUseCase.execute({ userId });
      const protoMatches = MatchGrpcMapper.toProtoList(matches);
      callback(null, protoMatches);
    } catch (error) {
      console.error("Error in GetMatches:", error);
      this.handleError(error, callback);
    }
  }

  async likeUser(
    call: grpc.ServerUnaryCall<LikeUserRequest, Match>,
    callback: grpc.sendUnaryData<Match>
  ): Promise<void> {
    try {
      const userId = call.request.getUserid();
      const targetUserId = call.request.getTargetuserid();
      const isSuperLike = call.request.getIsmatchlike();

      const match = await this.likeUserUseCase.execute({
        userId,
        targetUserId,
        isSuperLike,
      });

      const protoMatch = MatchGrpcMapper.toProto(match);
      callback(null, protoMatch);
    } catch (error) {
      console.error("Error in LikeUser:", error);
      this.handleError(error, callback);
    }
  }

  async dislikeUser(
    call: grpc.ServerUnaryCall<DislikeUserRequest, Empty>,
    callback: grpc.sendUnaryData<Empty>
  ): Promise<void> {
    try {
      const userId = call.request.getUserid();
      const targetUserId = call.request.getTargetuserid();

      await this.dislikeUserUseCase.execute({
        userId,
        targetUserId,
      });

      callback(null, new Empty());
    } catch (error) {
      console.error("Error in DislikeUser:", error);
      this.handleError(error, callback);
    }
  }

  private handleError(error: unknown, callback: grpc.sendUnaryData<any>): void {
    const message =
      error instanceof Error && error.message && error.message.trim().length > 0
        ? error.message
        : "Internal server error";

    callback({
      code: grpc.status.INTERNAL,
      message,
    });
  }
}
