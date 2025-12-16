import { Message } from "../entities/Message";
import { MessageId } from "../value-objects/MessageId";
import { ChatRoomId } from "../value-objects/ChatRoomId";

export interface IMessageRepository {
    save(message: Message): Promise<void>;
    findById(id: MessageId): Promise<Message | null>;
    findByChatRoomId(chatRoomId: ChatRoomId): Promise<Message[]>;
    findUnreadByReceiverId(receiverId: string): Promise<Message[]>;
    update(message: Message): Promise<void>;
    delete(id: MessageId): Promise<void>;
}