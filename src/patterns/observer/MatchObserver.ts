import { Match } from "../../types";

/**
 * Observer Pattern - Observer Interface
 * Defines the update method that all observers must implement
 */
export interface IMatchObserver {
  update(event: MatchEvent): void;
}

/**
 * Event types for match-related notifications
 */
export enum MatchEventType {
  MATCH_CREATED = "MATCH_CREATED",
  LIKE_SENT = "LIKE_SENT",
  SUPER_LIKE_SENT = "SUPER_LIKE_SENT",
  DISLIKE_SENT = "DISLIKE_SENT",
}

/**
 * Event data structure
 */
export interface MatchEvent {
  type: MatchEventType;
  data: {
    userId: string;
    targetUserId: string;
    match?: Match;
    isSuperLike?: boolean;
    timestamp: Date;
  };
}
