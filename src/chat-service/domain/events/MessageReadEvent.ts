import { DomainEvent } from "./DomainEvent";

export class MessageReadEvent extends DomainEvent {
    readonly messageId: string;
    readonly readerId: string;
    readonly readAt: Date;

    constructor(aggregateId: string, messageId: string, readerId: string, readAt: Date) {
        super(aggregateId);
        this.messageId = messageId;
        this.readerId = readerId;
        this.readAt = readAt;
    }

    getEventName(): string {
        return "MessageReadEvent";
    }
}