import { MessageId } from "../../domain/value-objects/MessageId";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository";

export class DeleteMessageUseCase {
    constructor(private readonly messageRepository: IMessageRepository) {}

    async execute(messageId: string, deleterId?: string): Promise<void> {
        const message = await this.messageRepository.findById(new MessageId(messageId));
        
        if (!message) {
            throw new Error("Message not found");
        }

        if (message.isRead) {
            throw new Error("Cannot delete a read message");
        }

        await this.messageRepository.delete(message.id);
    }
}