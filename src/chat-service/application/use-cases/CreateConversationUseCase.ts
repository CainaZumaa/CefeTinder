import { ChatRoomId } from "../../domain/value-objects/ChatRoomId";
import { Conversation } from "../../domain/entities/Conversation";
import { IConversationRepository } from "../../domain/repositories/IConversationRepository";
import { ChatPolicy } from "../../domain/services/ChatPolicy";

export class CreateConversationUseCase {
    constructor(private readonly conversationRepository: IConversationRepository) {}

    async execute(id: string, participants: string[]): Promise<void> {
        ChatPolicy.validateParticipantCount(participants.length);

        const chatRoomId = new ChatRoomId(id);
        const exists = await this.conversationRepository.exists(chatRoomId);
        
        if (exists) {
            throw new Error("Conversation already exists");
        }

        const conversation = new Conversation(chatRoomId, participants);
        await this.conversationRepository.save(conversation);
    }
}