import { IMatchObserver, MatchEvent, MatchEventType } from "./MatchObserver";
import { NotificationService } from "../../services/notification/NotificationService";

/**
 * Observer Pattern - Concrete Observer
 * Observes match events and sends notifications via WebSocket
 */
export class NotificationObserver implements IMatchObserver {
  private notificationService: NotificationService | null;

  constructor(notificationService: NotificationService | null) {
    this.notificationService = notificationService;
  }

  /**
   * Update method called when a match event occurs
   */
  public update(event: MatchEvent): void {
    if (!this.notificationService) {
      console.warn("NotificationService not available, skipping notification");
      return;
    }

    switch (event.type) {
      case MatchEventType.MATCH_CREATED:
        if (event.data.match) {
          console.log(
            `🎉 Match created between ${event.data.userId} and ${event.data.targetUserId}`
          );
          this.notificationService.notifyMatch(event.data.match);
        }
        break;

      case MatchEventType.LIKE_SENT:
        console.log(
          `👍 Like sent from ${event.data.userId} to ${event.data.targetUserId}`
        );
        this.notificationService.notifyLike(
          event.data.userId,
          event.data.targetUserId,
          false
        );
        break;

      case MatchEventType.SUPER_LIKE_SENT:
        console.log(
          `⭐ Super like sent from ${event.data.userId} to ${event.data.targetUserId}`
        );
        this.notificationService.notifyLike(
          event.data.userId,
          event.data.targetUserId,
          true
        );
        break;

      case MatchEventType.DISLIKE_SENT:
        console.log(
          `👎 Dislike sent from ${event.data.userId} to ${event.data.targetUserId}`
        );
        // You can add dislike notification handling here if needed
        break;

      default:
        console.warn(`Unknown event type: ${event.type}`);
    }
  }
}
