export class MessageSentIntegrationEvent {
    eventId: string;
    occurredOn: Date;
    messageId: string;
    senderId: string;
    receiverId: string;
    chatRoomId: string;
    content: string;

    constructor(
        messageId: string,
        senderId: string,
        receiverId: string,
        chatRoomId: string,
        content: string
    ) {
        this.eventId = this.generateEventId();
        this.occurredOn = new Date();
        this.messageId = messageId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.chatRoomId = chatRoomId;
        this.content = content;
    }

    private generateEventId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}