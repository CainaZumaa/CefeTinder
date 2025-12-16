import { ChatDomainException } from "../exceptions/ChatDomainException";

export class ChatPolicy {
    static readonly MAX_MESSAGES_PER_CONVERSATION = 10000;
    static readonly MAX_PARTICIPANTS_PER_CONVERSATION = 100;
    static readonly MESSAGE_RATE_LIMIT = 10;
    static readonly RATE_LIMIT_WINDOW_MS = 60000;

    static validateMessageCount(currentCount: number): void {
        if (currentCount >= this.MAX_MESSAGES_PER_CONVERSATION) {
            throw new ChatDomainException("Maximum number of messages reached for this conversation");
        }
    }

    static validateParticipantCount(currentCount: number): void {
        if (currentCount >= this.MAX_PARTICIPANTS_PER_CONVERSATION) {
            throw new ChatDomainException("Maximum number of participants reached for this conversation");
        }
    }

    static validateMessageRate(messageTimestamps: Date[], newTimestamp: Date): void {
        const windowStart = new Date(newTimestamp.getTime() - this.RATE_LIMIT_WINDOW_MS);
        const recentMessages = messageTimestamps.filter(t => t >= windowStart);

        if (recentMessages.length >= this.MESSAGE_RATE_LIMIT) {
            throw new ChatDomainException("Message rate limit exceeded");
        }
    }
}