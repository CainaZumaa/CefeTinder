import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { MessageSentEvent } from "../events/MessageSentEvent";
import { MessageReadEvent } from "../events/MessageReadEvent";

export class ConversationAggregate {
    private conversation: Conversation;
    private messages: Message[] = [];

    constructor(conversation: Conversation, messages: Message[] = []) {
        this.conversation = conversation;
        this.messages = messages;
    }

    sendMessage(message: Message): MessageSentEvent[] {
        this.conversation.addMessage(message);
        this.messages.push(message);
        return this.conversation.domainEvents;
    }

    markMessageAsRead(messageId: string, readerId: string): MessageReadEvent[] {
        const message = this.messages.find(m => m.id.value === messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        message.markAsRead(readerId);
        return message.domainEvents;
    }

    getConversation(): Conversation {
        return this.conversation;
    }

    getMessages(): Message[] {
        return [...this.messages];
    }

    getUnreadMessagesCount(userId: string): number {
        return this.messages.filter(
            m => m.receiverId.value === userId && !m.isRead
        ).length;
    }

    clearAllEvents(): void {
        this.conversation.clearEvents();
        this.messages.forEach(m => m.clearEvents());
    }
}