export const Exchanges = {
    CHAT_EVENTS: 'chat_events',
    MESSAGE_EVENTS: 'message_events'
} as const;

export const ExchangeTypes = {
    DIRECT: 'direct',
    TOPIC: 'topic',
    FANOUT: 'fanout'
} as const;