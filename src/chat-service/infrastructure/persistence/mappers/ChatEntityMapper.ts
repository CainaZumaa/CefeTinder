import { Message } from '../../../domain/entities/Message';
import { Conversation } from '../../../domain/entities/Conversation';
import { MessageId } from '../../../domain/value-objects/MessageId';
import { Content } from '../../../domain/value-objects/Content';
import { SenderId } from '../../../domain/value-objects/SenderId';
import { ReceiverId } from '../../../domain/value-objects/ReceiverId';
import { ChatRoomId } from '../../../domain/value-objects/ChatRoomId';
import { Timestamp } from '../../../domain/value-objects/Timestamp';

export class ChatEntityMapper {
    static toMessageEntity(row: any): Message {
        return new Message(
            new MessageId(row.id),
            new Content(row.content),
            new SenderId(row.sender_id),
            new ReceiverId(row.receiver_id),
            new ChatRoomId(row.chat_room_id),
            new Timestamp(new Date(row.sent_at)),
            row.read_at ? new Timestamp(new Date(row.read_at)) : null
        );
    }

    static toMessageTable(message: Message): any {
        return {
            id: message.id.value,
            content: message.content.value,
            sender_id: message.senderId.value,
            receiver_id: message.receiverId.value,
            chat_room_id: message.chatRoomId.value,
            sent_at: message.sentAt.value,
            read_at: message.readAt ? message.readAt.value : null
        };
    }

    static toConversationEntity(row: any): Conversation {
        return new Conversation(
            new ChatRoomId(row.id),
            row.participants || [],
            new Date(row.last_message_at)
        );
    }

    static toConversationTable(conversation: Conversation): any {
        return {
            id: conversation.id.value,
            participants: conversation.getParticipants(),
            last_message_at: conversation.lastMessageAt
        };
    }
}