import { MatchRepository } from "../ports/MatchRepository";
import { MatchEventPublisher } from "../ports/MatchEventPublisher";
import { Match } from "../../domain/entities/Match";
import { UserId } from "../../domain/value-objects/UserId";

export type DislikeUserInput = {
  userId: string;
  targetUserId: string;
};

export class DislikeUserUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly eventPublisher: MatchEventPublisher
  ) {}

  async execute(input: DislikeUserInput): Promise<void> {
    const actor = UserId.create(input.userId);
    const target = UserId.create(input.targetUserId);

    let match = await this.matchRepository.findBetweenUsers(actor, target);
    if (!match) {
      match = Match.createNewDislike({ userId: actor, targetUserId: target });
    }

    const outcome = match.dislike(actor);
    const saved = await this.matchRepository.save(match);
    const event = saved.toEvent(outcome);
    await this.eventPublisher.publish(event);
  }
}
