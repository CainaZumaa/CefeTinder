export const Queues = {
    MESSAGE_SENT_QUEUE: 'message_sent_queue',
    MESSAGE_READ_QUEUE: 'message_read_queue',
    NOTIFICATIONS_QUEUE: 'notifications_queue'
} as const;

export const RoutingKeys = {
    MESSAGE_SENT: 'message.sent',
    MESSAGE_READ: 'message.read'
} as const;