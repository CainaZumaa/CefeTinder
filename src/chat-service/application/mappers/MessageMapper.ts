import { MessageDTO } from "../dtos/MessageDTO";
import { Message } from "../../domain/entities/Message";

export class MessageMapper {
    static toDTO(message: Message): MessageDTO {
        return {
            id: message.id.value,
            content: message.content.value,
            senderId: message.senderId.value,
            receiverId: message.receiverId.value,
            chatRoomId: message.chatRoomId.value,
            sentAt: message.sentAt.value,
            readAt: message.readAt ? message.readAt.value : null,
            isRead: message.isRead
        };
    }

    static toDTOList(messages: Message[]): MessageDTO[] {
        return messages.map(message => this.toDTO(message));
    }
}