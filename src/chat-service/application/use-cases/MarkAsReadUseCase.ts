import { MessageId } from "../../domain/value-objects/MessageId";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository";
import { EventBus } from "../ports/EventBus";
import { MessageMapper } from "../mappers/MessageMapper";
import { MessageDTO } from "../dtos/MessageDTO";

export class MarkAsReadUseCase {
    constructor(
        private readonly messageRepository: IMessageRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(messageId: string, receiverId: string): Promise<MessageDTO> {
        const message = await this.messageRepository.findById(new MessageId(messageId));
        
        if (!message) {
            throw new Error("Message not found");
        }

        message.markAsRead(receiverId);
        
        await this.messageRepository.update(message);

        const events = message.domainEvents;
        for (const event of events) {
            await this.eventBus.publish(event);
        }
        message.clearEvents();

        return MessageMapper.toDTO(message);
    }
}