import { MatchEvent } from "../../domain/events/MatchEvent";

export interface MatchEventPublisher {
  publish(event: MatchEvent): Promise<void>;
}
