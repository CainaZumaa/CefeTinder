import { Conversation } from "../entities/Conversation";
import { ChatRoomId } from "../value-objects/ChatRoomId";

export interface IConversationRepository {
    save(conversation: Conversation): Promise<void>;
    findById(id: ChatRoomId): Promise<Conversation | null>;
    findByParticipant(userId: string): Promise<Conversation[]>;
    exists(id: ChatRoomId): Promise<boolean>;
    update(conversation: Conversation): Promise<void>;
    delete(id: ChatRoomId): Promise<void>;
}