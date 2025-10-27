import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { MatchService } from "../../services/match/MatchService";
import { Match } from "../../types/graphql";

// to-do: Acho que vale usar Decorator pattern aqui para adicionar logging,
// validação e métricas aos resolvers sem modificar a lógica principal
@Resolver()
export class MatchResolver {
  private matchService = new MatchService();

  @Query(() => [Match])
  async getMatches(@Arg("userId") userId: string): Promise<Match[]> {
    return this.matchService.getMatches(userId);
  }

  @Mutation(() => Match, { nullable: true })
  async likeUser(
    @Arg("userId") userId: string,
    @Arg("targetUserId") targetUserId: string,
    @Arg("isSuperLike", { defaultValue: false }) isSuperLike: boolean
  ): Promise<Match | null> {
    return this.matchService.likeUser(userId, targetUserId, isSuperLike);
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
