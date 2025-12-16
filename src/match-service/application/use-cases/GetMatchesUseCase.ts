import { MatchRepository } from "../ports/MatchRepository";
import { Match } from "../../domain/entities/Match";
import { UserId } from "../../domain/value-objects/UserId";

export type GetMatchesInput = {
  userId: string;
};

export class GetMatchesUseCase {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(input: GetMatchesInput): Promise<Match[]> {
    const userId = UserId.create(input.userId);
    return this.matchRepository.listConfirmed(userId);
  }
}
