import { Notification } from "../../domain/entities/Notification";
import { UserId } from "../../domain/value-objects/UserId";
import { NotificationSender } from "../ports/NotificationSender";

export interface LikeNotificationInput {
  fromUserId: string;
  toUserId: string;
  isSuperLike?: boolean;
}

export class NotifyLikeUseCase {
  constructor(private readonly sender: NotificationSender) {}

  execute(input: LikeNotificationInput): void {
    const from = UserId.create(input.fromUserId);
    const to = UserId.create(input.toUserId);

    const notification = Notification.create({
      type: "LIKE",
      recipients: [to],
      payload: {
        fromUserId: from.toString(),
        isSuperLike: Boolean(input.isSuperLike),
      },
    });

    this.sender.send(notification);
  }
}
