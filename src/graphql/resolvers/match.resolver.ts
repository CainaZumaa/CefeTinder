import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Match } from "../types/match.type";
import { MatchServiceClient } from "../../grpc/match/match.client";

// to-do: Acho que vale usar Decorator pattern aqui para adicionar logging,
// validação e métricas aos resolvers sem modificar a lógica principal
@Resolver(Match)
export class MatchResolver {
  private matchService = new MatchServiceClient();

  @Query(() => [Match])
  async getMatches(@Arg("userId") userId: string): Promise<Match[]> {
    const grpcMatches = await this.matchService.getMatches(userId);

    const matches: Match[] = grpcMatches.map(grpcMatch => ({
      id: grpcMatch.getId(),
      user1_id: grpcMatch.getUser1id(),
      user2_id: grpcMatch.getUser2id(),
      user1_liked: grpcMatch.getUser1liked(),
      user2_liked: grpcMatch.getUser2liked(),
      is_super_like: grpcMatch.getIssuperlike(),
      matched_at: new Date(grpcMatch.getMatchedat()),
      created_at: new Date(grpcMatch.getCreatedat()),
      updated_at: new Date(grpcMatch.getUpdatedat()),
    }));

    return matches;
  }

  @Mutation(() => Match, { nullable: true })
  async likeUser(
    @Arg("userId") userId: string,
    @Arg("targetUserId") targetUserId: string,
    @Arg("isSuperLike", { defaultValue: false }) isSuperLike: boolean
  ): Promise<Match | null> {
    const grpcMatch = await this.matchService.likeUser(userId, targetUserId, isSuperLike);
    if (!grpcMatch) return null;
    // Mapeie também aqui se necessário
    return {
      id: grpcMatch.getId(),
      user1_id: grpcMatch.getUser1id(),
      user2_id: grpcMatch.getUser2id(),
      user1_liked: grpcMatch.getUser1liked(),
      user2_liked: grpcMatch.getUser2liked(),
      is_super_like: grpcMatch.getIssuperlike(),
      created_at: new Date(grpcMatch.getCreatedat()),
      updated_at: new Date(grpcMatch.getUpdatedat()),
    };
  }

  @Mutation(() => Boolean)
  async dislikeUser(
    @Arg("userId") userId: string,
    @Arg("targetUserId") targetUserId: string
  ): Promise<boolean> {
    await this.matchService.dislikeUser(userId, targetUserId);
    return true;
  }
}