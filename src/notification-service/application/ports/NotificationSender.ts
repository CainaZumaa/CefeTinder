import { Notification } from "../../domain/entities/Notification";

export interface NotificationSender {
  send(notification: Notification): void;
}
