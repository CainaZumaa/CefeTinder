import { MessageId } from '../value-objects/MessageId';
import { Content } from '../value-objects/Content';
import { SenderId } from '../value-objects/SenderId';
import { ReceiverId } from '../value-objects/ReceiverId';
import { ChatRoomId } from '../value-objects/ChatRoomId';
import { Timestamp } from '../value-objects/Timestamp';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export class Message {
  private _id: MessageId;
  private _content: Content;
  private _senderId: SenderId;
  private _receiverId: ReceiverId;
  private _roomId: ChatRoomId;
  private _status: MessageStatus;
  private _sentAt: Timestamp;
  private _deliveredAt?: Timestamp;
  private _readAt?: Timestamp;
  private _replyTo?: MessageId;
  private _metadata: Record<string, any>;

  private constructor(
    id: MessageId,
    content: Content,
    senderId: SenderId,
    receiverId: ReceiverId,
    roomId: ChatRoomId,
    status: MessageStatus,
    sentAt: Timestamp,
    replyTo?: MessageId,
    metadata: Record<string, any> = {}
  ) {
    this._id = id;
    this._content = content;
    this._senderId = senderId;
    this._receiverId = receiverId;
    this._roomId = roomId;
    this._status = status;
    this._sentAt = sentAt;
    this._replyTo = replyTo;
    this._metadata = metadata;
  }

  static create(
    content: Content,
    senderId: SenderId,
    receiverId: ReceiverId,
    roomId: ChatRoomId,
    replyTo?: MessageId,
    metadata: Record<string, any> = {}
  ): Message {
    const message = new Message(
      MessageId.generate(),
      content,
      senderId,
      receiverId,
      roomId,
      MessageStatus.SENT,
      Timestamp.create(),
      replyTo,
      metadata
    );

    return message;
  }

  static restore(
    id: MessageId,
    content: Content,
    senderId: SenderId,
    receiverId: ReceiverId,
    roomId: ChatRoomId,
    status: MessageStatus,
    sentAt: Timestamp,
    deliveredAt?: Timestamp,
    readAt?: Timestamp,
    replyTo?: MessageId,
    metadata: Record<string, any> = {}
  ): Message {
    const message = new Message(
      id,
      content,
      senderId,
      receiverId,
      roomId,
      status,
      sentAt,
      replyTo,
      metadata
    );
    
    message._deliveredAt = deliveredAt;
    message._readAt = readAt;
    
    return message;
  }

  markAsDelivered(): void {
    if (this._status !== MessageStatus.SENT) {
      throw new Error('Only sent messages can be marked as delivered');
    }
    
    this._status = MessageStatus.DELIVERED;
    this._deliveredAt = Timestamp.create();
    
  }

  markAsRead(): void {
    if (this._status === MessageStatus.SENT) {
      this.markAsDelivered();
    }
    
    if (this._status !== MessageStatus.DELIVERED) {
      throw new Error('Only delivered messages can be marked as read');
    }
    
    this._status = MessageStatus.READ;
    this._readAt = Timestamp.create();
    
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  editContent(newContent: Content): void {
    // Somente o remetente pode editar a mensagem
    // Apenas mensagens não entregues podem ser editadas
    if (this._status !== MessageStatus.SENT) {
      throw new Error('Only sent messages can be edited');
    }
    
    // Verificar se não passou muito tempo desde o envio (ex: 2 minutos)
    const twoMinutesAgo = Timestamp.create(new Date(Date.now() - 2 * 60 * 1000));
    if (this._sentAt.isBefore(twoMinutesAgo)) {
      throw new Error('Message can only be edited within 2 minutes of sending');
    }
    
    this._content = newContent;
  }

  // Getters
  get id(): MessageId { return this._id; }
  get content(): Content { return this._content; }
  get senderId(): SenderId { return this._senderId; }
  get receiverId(): ReceiverId { return this._receiverId; }
  get roomId(): ChatRoomId { return this._roomId; }
  get status(): MessageStatus { return this._status; }
  get sentAt(): Timestamp { return this._sentAt; }
  get deliveredAt(): Timestamp | undefined { return this._deliveredAt; }
  get readAt(): Timestamp | undefined { return this._readAt; }
  get replyTo(): MessageId | undefined { return this._replyTo; }
  get metadata(): Record<string, any> { return { ...this._metadata }; }


  isFromUser(userId: string): boolean {
    return this._senderId.value === userId;
  }

  canBeDeletedBy(userId: string): boolean {
    // O remetente pode deletar a qualquer momento
    // O receptor pode deletar apenas se a mensagem foi lida
    if (this.isFromUser(userId)) {
      return true;
    }
    return this._status === MessageStatus.READ;
  }
}