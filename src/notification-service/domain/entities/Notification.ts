import { NotificationType } from "../value-objects/NotificationType";
import { UserId } from "../value-objects/UserId";

export type NotificationPayload = Record<string, unknown>;

export class Notification {
  private constructor(
    public readonly type: NotificationType,
    public readonly recipients: readonly UserId[],
    public readonly payload: NotificationPayload,
    public readonly occurredAt: Date
  ) {}

  public static create(params: {
    type: NotificationType;
    recipients: readonly UserId[];
    payload: NotificationPayload;
    occurredAt?: Date;
  }): Notification {
    if (!params.recipients || params.recipients.length === 0) {
      throw new Error("Notification must have at least one recipient");
    }

    return new Notification(
      params.type,
      params.recipients,
      params.payload,
      params.occurredAt ?? new Date()
    );
  }
}
