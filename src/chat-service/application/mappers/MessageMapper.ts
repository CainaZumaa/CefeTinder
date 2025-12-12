import { Message } from '../../domain/entities/Message';
import { MessageDTO } from '../dtos/MessageDTO';

export class MessageMapper {
  static toDTO(message: Message): MessageDTO {
    return {
      id: message.id.value,
      content: message.content.value,
      senderId: message.senderId.value,
      receiverId: message.receiverId.value,
      roomId: message.roomId.value,
      status: message.status,
      sentAt: message.sentAt.isoString,
      deliveredAt: message.deliveredAt?.isoString,
      readAt: message.readAt?.isoString,
      replyTo: message.replyTo?.value,
      metadata: { ...message.metadata },
      isEdited: message.metadata.editedAt !== undefined,
      editedAt: message.metadata.editedAt,
      deletedFor: message.metadata.deletedFor || []
    };
  }

  static toDomain(dto: MessageDTO, id?: string): Message {
    const MessageId = require('../../domain/value-objects/MessageId').MessageId;
    const Content = require('../../domain/value-objects/Content').Content;
    const SenderId = require('../../domain/value-objects/SenderId').SenderId;
    const ReceiverId = require('../../domain/value-objects/ReceiverId').ReceiverId;
    const ChatRoomId = require('../../domain/value-objects/ChatRoomId').ChatRoomId;
    const Timestamp = require('../../domain/value-objects/Timestamp').Timestamp;

    const messageId = id ? MessageId.create(id) : MessageId.create(dto.id);
    const content = Content.create(dto.content);
    const senderId = SenderId.create(dto.senderId);
    const receiverId = ReceiverId.create(dto.receiverId);
    const roomId = ChatRoomId.create(dto.roomId);
    const sentAt = Timestamp.fromISOString(dto.sentAt);
    const deliveredAt = dto.deliveredAt ? Timestamp.fromISOString(dto.deliveredAt) : undefined;
    const readAt = dto.readAt ? Timestamp.fromISOString(dto.readAt) : undefined;
    const replyTo = dto.replyTo ? MessageId.create(dto.replyTo) : undefined;

    const message = Message.restore(
      messageId,
      content,
      senderId,
      receiverId,
      roomId,
      dto.status as any,
      sentAt,
      deliveredAt,
      readAt,
      replyTo,
      dto.metadata
    );

    return message;
  }

  static toDTOArray(messages: Message[]): MessageDTO[] {
    return messages.map(message => this.toDTO(message));
  }

  static toDomainArray(dtos: MessageDTO[]): Message[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  static toSummary(message: Message): Partial<MessageDTO> {
    return {
      id: message.id.value,
      content: message.content.value.substring(0, 100) + 
               (message.content.value.length > 100 ? '...' : ''),
      senderId: message.senderId.value,
      status: message.status,
      sentAt: message.sentAt.isoString
    };
  }
}