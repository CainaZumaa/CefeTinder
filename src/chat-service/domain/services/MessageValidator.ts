import { Content } from "../value-objects/Content";
import { MessageValidationException } from "../exceptions/MessageValidationException";

export class MessageValidator {
    static validateContent(content: string): void {
        if (!content || content.trim().length === 0) {
            throw new MessageValidationException("Message content cannot be empty");
        }

        if (content.length > 2000) {
            throw new MessageValidationException("Message content cannot exceed 2000 characters");
        }
    }

    static validateSenderAndReceiver(senderId: string, receiverId: string): void {
        if (!senderId || !receiverId) {
            throw new MessageValidationException("Sender and receiver IDs are required");
        }

        if (senderId === receiverId) {
            throw new MessageValidationException("Sender and receiver cannot be the same");
        }
    }

    static validateTimestamps(sentAt: Date, readAt?: Date): void {
        if (readAt && readAt < sentAt) {
            throw new MessageValidationException("Read timestamp cannot be before sent timestamp");
        }

        if (sentAt > new Date()) {
            throw new MessageValidationException("Sent timestamp cannot be in the future");
        }
    }
}