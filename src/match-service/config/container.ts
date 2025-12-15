import { PostgresMatchRepository } from "../infrastructure/persistence/PostgresMatchRepository";
import { RabbitMQMatchEventPublisherAdapter } from "../infrastructure/messaging/RabbitMQMatchEventPublisherAdapter";
import { LikeUserUseCase } from "../application/use-cases/LikeUserUseCase";
import { DislikeUserUseCase } from "../application/use-cases/DislikeUserUseCase";
import { GetMatchesUseCase } from "../application/use-cases/GetMatchesUseCase";
import { MatchEventPublisher } from "../application/ports/MatchEventPublisher";
import { MatchGrpcController } from "../presentation/grpc/MatchGrpcController";

class NoopMatchEventPublisher implements MatchEventPublisher {
  async publish(): Promise<void> {}
}

export function buildMatchContainer() {
  const repository = new PostgresMatchRepository();
  const rabbitUrl = process.env.RABBITMQ_URL;
  const publisher = rabbitUrl
    ? new RabbitMQMatchEventPublisherAdapter(rabbitUrl)
    : new NoopMatchEventPublisher();

  const likeUserUseCase = new LikeUserUseCase(repository, publisher);
  const dislikeUserUseCase = new DislikeUserUseCase(repository, publisher);
  const getMatchesUseCase = new GetMatchesUseCase(repository);
  const controller = new MatchGrpcController(
    likeUserUseCase,
    dislikeUserUseCase,
    getMatchesUseCase
  );

  return {
    likeUserUseCase,
    dislikeUserUseCase,
    getMatchesUseCase,
    controller,
  };
}
