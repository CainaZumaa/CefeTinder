export const NotificationTypes = ["MATCH", "LIKE"] as const;

export type NotificationType = (typeof NotificationTypes)[number];

export function isNotificationType(value: string): value is NotificationType {
  return (NotificationTypes as readonly string[]).includes(value);
}
