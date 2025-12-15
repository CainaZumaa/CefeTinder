import { MatchRepository } from "../ports/MatchRepository";
import { MatchEventPublisher } from "../ports/MatchEventPublisher";
import { Match } from "../../domain/entities/Match";
import { UserId } from "../../domain/value-objects/UserId";

export type LikeUserInput = {
  userId: string;
  targetUserId: string;
  isSuperLike?: boolean;
};

export class LikeUserUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly eventPublisher: MatchEventPublisher
  ) {}

  async execute(input: LikeUserInput): Promise<Match> {
    const actor = UserId.create(input.userId);
    const target = UserId.create(input.targetUserId);
    const isSuperLike = Boolean(input.isSuperLike);

    let match = await this.matchRepository.findBetweenUsers(actor, target);
    if (!match) {
      match = Match.createNewLike({ userId: actor, targetUserId: target, isSuperLike });
    }

    const outcome = match.like(actor, isSuperLike);
    const saved = await this.matchRepository.save(match);
    const event = saved.toEvent(outcome);
    await this.eventPublisher.publish(event);

    return saved;
  }
}
