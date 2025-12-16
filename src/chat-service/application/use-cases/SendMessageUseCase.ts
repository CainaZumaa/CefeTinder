import { MessageId } from "../../domain/value-objects/MessageId";
import { Content } from "../../domain/value-objects/Content";
import { SenderId } from "../../domain/value-objects/SenderId";
import { ReceiverId } from "../../domain/value-objects/ReceiverId";
import { ChatRoomId } from "../../domain/value-objects/ChatRoomId";
import { Timestamp } from "../../domain/value-objects/Timestamp";
import { Message } from "../../domain/entities/Message";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository";
import { IConversationRepository } from "../../domain/repositories/IConversationRepository";
import { MessageValidator } from "../../domain/services/MessageValidator";
import { ChatPolicy } from "../../domain/services/ChatPolicy";
import { EventBus } from "../ports/EventBus";
import { MessageMapper } from "../mappers/MessageMapper";
import { MessageDTO } from "../dtos/MessageDTO";

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute({
    messageId,
    content,
    senderId,
    receiverId,
    chatRoomId,
    sentAt = new Date(),
  }: {
    messageId: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatRoomId: string;
    sentAt?: Date;
  }): Promise<MessageDTO> {
    MessageValidator.validateContent(content);
    MessageValidator.validateSenderAndReceiver(senderId, receiverId);
    MessageValidator.validateTimestamps(sentAt);

    const conversation = await this.conversationRepository.findById(
      new ChatRoomId(chatRoomId)
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const existingMessages = await this.messageRepository.findByChatRoomId(
      new ChatRoomId(chatRoomId)
    );
    ChatPolicy.validateMessageCount(existingMessages.length);

    const messageTimestamps = existingMessages.map((m) => m.sentAt.value);
    ChatPolicy.validateMessageRate(messageTimestamps, sentAt);

    const message = new Message(
      new MessageId(messageId),
      new Content(content),
      new SenderId(senderId),
      new ReceiverId(receiverId),
      new ChatRoomId(chatRoomId),
      new Timestamp(sentAt)
    );

    conversation.addMessage(message);

    await this.messageRepository.save(message);
    await this.conversationRepository.update(conversation);

    const events = conversation.domainEvents;
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    conversation.clearEvents();

    return MessageMapper.toDTO(message);
  }
}
