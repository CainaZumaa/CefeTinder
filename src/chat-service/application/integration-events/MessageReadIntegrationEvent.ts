export class MessageReadIntegrationEvent {
    eventId: string;
    occurredOn: Date;
    messageId: string;
    readerId: string;
    readAt: Date;
    chatRoomId: string;

    constructor(
        messageId: string,
        readerId: string,
        readAt: Date,
        chatRoomId: string
    ) {
        this.eventId = this.generateEventId();
        this.occurredOn = new Date();
        this.messageId = messageId;
        this.readerId = readerId;
        this.readAt = readAt;
        this.chatRoomId = chatRoomId;
    }

    private generateEventId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}