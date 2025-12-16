import { ChatRoomId } from "../value-objects/ChatRoomId";
import { Message } from "./Message";
import { MessageSentEvent } from "../events/MessageSentEvent";

export class Conversation {
    readonly id: ChatRoomId;
    private _participants: Set<string>;
    private _messages: Message[] = [];
    private _lastMessageAt: Date;
    private _domainEvents: MessageSentEvent[] = [];

    constructor(id: ChatRoomId, participants: string[], lastMessageAt: Date = new Date()) {
        this.id = id;
        this._participants = new Set(participants);
        this._lastMessageAt = lastMessageAt;
    }

    addMessage(message: Message): void {
        if (!this._participants.has(message.senderId.value)) {
            throw new Error("Sender is not a participant of this conversation");
        }
        if (!this._participants.has(message.receiverId.value)) {
            throw new Error("Receiver is not a participant of this conversation");
        }

        this._messages.push(message);
        this._lastMessageAt = new Date();

        const event = new MessageSentEvent(
            this.id.value,
            message.id.value,
            message.senderId.value,
            message.receiverId.value,
            message.chatRoomId.value,
            message.content.value
        );
        this._domainEvents.push(event);
    }

    getMessages(): Message[] {
        return [...this._messages];
    }

    getParticipants(): string[] {
        return Array.from(this._participants);
    }

    addParticipant(userId: string): void {
        this._participants.add(userId);
    }

    removeParticipant(userId: string): void {
        if (this._participants.size <= 2) {
            throw new Error("Cannot remove participant from a conversation with 2 or fewer participants");
        }
        this._participants.delete(userId);
    }

    get lastMessageAt(): Date {
        return this._lastMessageAt;
    }

    get domainEvents(): MessageSentEvent[] {
        return [...this._domainEvents];
    }

    clearEvents(): void {
        this._domainEvents = [];
    }
}