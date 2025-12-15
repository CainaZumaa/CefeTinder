import { Match } from "../../domain/entities/Match";
import { UserId } from "../../domain/value-objects/UserId";

export interface MatchRepository {
  findBetweenUsers(userA: UserId, userB: UserId): Promise<Match | null>;
  save(match: Match): Promise<Match>;
  listConfirmed(userId: UserId): Promise<Match[]>;
}
