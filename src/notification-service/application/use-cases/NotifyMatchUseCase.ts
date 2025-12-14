import { Notification } from "../../domain/entities/Notification";
import { UserId } from "../../domain/value-objects/UserId";
import { NotificationSender } from "../ports/NotificationSender";

export interface MatchNotificationInput {
  matchId: string;
  user1Id: string;
  user2Id: string;
  matchedAt?: string | Date;
  isSuperLike?: boolean;
}

export class NotifyMatchUseCase {
  constructor(private readonly sender: NotificationSender) {}

  execute(input: MatchNotificationInput): void {
    const user1 = UserId.create(input.user1Id);
    const user2 = UserId.create(input.user2Id);

    const notification = Notification.create({
      type: "MATCH",
      recipients: [user1, user2],
      payload: {
        matchId: input.matchId,
        matchedAt:
          input.matchedAt instanceof Date
            ? input.matchedAt.toISOString()
            : input.matchedAt,
        isSuperLike: Boolean(input.isSuperLike),
      },
    });

    this.sender.send(notification);
  }
}
