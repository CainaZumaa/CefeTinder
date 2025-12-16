import { MessageId } from "../value-objects/MessageId";
import { Content } from "../value-objects/Content";
import { SenderId } from "../value-objects/SenderId";
import { ReceiverId } from "../value-objects/ReceiverId";
import { ChatRoomId } from "../value-objects/ChatRoomId";
import { Timestamp } from "../value-objects/Timestamp";
import { MessageReadEvent } from "../events/MessageReadEvent";

export class Message {
    readonly id: MessageId;
    readonly content: Content;
    readonly senderId: SenderId;
    readonly receiverId: ReceiverId;
    readonly chatRoomId: ChatRoomId;
    readonly sentAt: Timestamp;
    private _readAt: Timestamp | null;
    private _isRead: boolean;
    private _domainEvents: MessageReadEvent[] = [];

    constructor(
        id: MessageId,
        content: Content,
        senderId: SenderId,
        receiverId: ReceiverId,
        chatRoomId: ChatRoomId,
        sentAt: Timestamp = new Timestamp(),
        readAt: Timestamp | null = null
    ) {
        this.id = id;
        this.content = content;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.chatRoomId = chatRoomId;
        this.sentAt = sentAt;
        this._readAt = readAt;
        this._isRead = readAt !== null;
    }

    markAsRead(readerId: string, readAt: Date = new Date()): void {
        if (this._isRead) {
            return;
        }

        if (readerId !== this.receiverId.value) {
            throw new Error("Only the receiver can mark the message as read");
        }

        this._readAt = new Timestamp(readAt);
        this._isRead = true;

        const event = new MessageReadEvent(
            this.chatRoomId.value,
            this.id.value,
            readerId,
            readAt
        );
        this._domainEvents.push(event);
    }

    get isRead(): boolean {
        return this._isRead;
    }

    get readAt(): Timestamp | null {
        return this._readAt;
    }

    get domainEvents(): MessageReadEvent[] {
        return [...this._domainEvents];
    }

    clearEvents(): void {
        this._domainEvents = [];
    }
}