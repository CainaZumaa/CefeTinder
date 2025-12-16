import { Match } from "../../../domain/entities/Match";
import {
  Match as ProtoMatch,
  Matches,
} from "../../../../grpc/proto/match_pb";

export class MatchGrpcMapper {
  static toProto(match: Match): ProtoMatch {
    const protoMatch = new ProtoMatch();
    protoMatch.setId(match.id ?? "");
    protoMatch.setUser1id(match.user1Id.toString());
    protoMatch.setUser2id(match.user2Id.toString());
    protoMatch.setUser1liked(match.user1Liked);
    protoMatch.setUser2liked(match.user2Liked);
    protoMatch.setIssuperlike(match.isSuperLike);
    protoMatch.setMatchedat(
      match.matchedAt ? match.matchedAt.toISOString() : ""
    );
    protoMatch.setCreatedat(
      match.createdAt
        ? match.createdAt.toISOString()
        : new Date().toISOString()
    );
    protoMatch.setUpdatedat(
      match.updatedAt
        ? match.updatedAt.toISOString()
        : new Date().toISOString()
    );
    return protoMatch;
  }

  static toProtoList(matches: Match[]): Matches {
    const protoMatches = new Matches();
    const protoMatchList = matches.map((match) => this.toProto(match));
    protoMatches.setMatchesList(protoMatchList);
    return protoMatches;
  }
}
