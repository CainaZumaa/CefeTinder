import { MatchEventPublisher } from "../../application/ports/MatchEventPublisher";
import { MatchEvent } from "../../domain/events/MatchEvent";
import {
  MatchEventsPublisher,
  MatchRoutingKey,
  RabbitMQMatchEventsPublisher,
} from "../../../messaging/MatchEventsPublisher";

const routingKeyByEvent: Record<MatchEvent["type"], MatchRoutingKey> = {
  MATCH_LIKE_SENT: "match.like_sent",
  MATCH_SUPER_LIKE_SENT: "match.super_like_sent",
  MATCH_CREATED: "match.match_created",
  MATCH_DISLIKE_SENT: "match.dislike_sent",
};

export class RabbitMQMatchEventPublisherAdapter implements MatchEventPublisher {
  private readonly publisher: MatchEventsPublisher;

  constructor(url: string, exchange?: string) {
    this.publisher = new RabbitMQMatchEventsPublisher(url, exchange);
  }

  async publish(event: MatchEvent): Promise<void> {
    const routingKey = routingKeyByEvent[event.type];
    await this.publisher.publish(routingKey, {
      ...event.payload,
      occurredAt: new Date().toISOString(),
    });
  }
}
