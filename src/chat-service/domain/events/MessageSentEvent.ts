import { DomainEvent } from "./DomainEvent";

export class MessageSentEvent extends DomainEvent {
    readonly messageId: string;
    readonly senderId: string;
    readonly receiverId: string;
    readonly chatRoomId: string;
    readonly content: string;

    constructor(
        aggregateId: string,
        messageId: string,
        senderId: string,
        receiverId: string,
        chatRoomId: string,
        content: string
    ) {
        super(aggregateId);
        this.messageId = messageId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.chatRoomId = chatRoomId;
        this.content = content;
    }

    getEventName(): string {
        return "MessageSentEvent";
    }
}