import { ChatRoomId } from '../value-objects/ChatRoomId';
import { Message } from '../entities/Message';
import { Timestamp } from '../value-objects/Timestamp';
import { MessageId } from '../value-objects/MessageId';
import { MessageValidationException } from '../exceptions/MessageValidationException';

export interface Participant {
  userId: string;
  joinedAt: Timestamp;
  isActive: boolean;
  lastSeen?: Timestamp;
}

export class Conversation {
  private _roomId: ChatRoomId;
  private _participants: Map<string, Participant>;
  private _messages: Message[] = [];
  private _lastMessage?: Message;
  private _createdAt: Timestamp;
  private _updatedAt: Timestamp;
  private _typingUsers: Set<string> = new Set();
  private _events: any[] = [];
  private _isGroup: boolean;
  private _metadata: Record<string, any> = {};

  private constructor(
    roomId: ChatRoomId,
    participants: Participant[],
    isGroup: boolean = false,
    metadata: Record<string, any> = {}
  ) {
    this._roomId = roomId;
    this._participants = new Map(participants.map(p => [p.userId, p]));
    this._isGroup = isGroup;
    this._metadata = metadata;
    this._createdAt = Timestamp.create();
    this._updatedAt = this._createdAt;
    
    this.validate();
  }

  static createDirect(userId1: string, userId2: string): Conversation {
    const roomId = ChatRoomId.createDirect(userId1, userId2);
    
    const participants: Participant[] = [
      {
        userId: userId1,
        joinedAt: Timestamp.create(),
        isActive: true
      },
      {
        userId: userId2,
        joinedAt: Timestamp.create(),
        isActive: true
      }
    ];

    return new Conversation(roomId, participants, false);
  }

  static createGroup(
    groupId: string,
    participants: string[],
    metadata: Record<string, any> = {}
  ): Conversation {
    if (participants.length < 2) {
      throw new Error('Group must have at least 2 participants');
    }

    const roomId = ChatRoomId.createGroup(groupId);
    
    const participantObjects: Participant[] = participants.map(userId => ({
      userId,
      joinedAt: Timestamp.create(),
      isActive: true
    }));

    return new Conversation(roomId, participantObjects, true, metadata);
  }

  static restore(
    roomId: ChatRoomId,
    participants: Participant[],
    messages: Message[],
    isGroup: boolean,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    metadata: Record<string, any> = {}
  ): Conversation {
    const conversation = new Conversation(roomId, participants, isGroup, metadata);
    conversation._messages = messages;
    conversation._lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
    conversation._createdAt = createdAt;
    conversation._updatedAt = updatedAt;
    
    return conversation;
  }

  addMessage(message: Message): void {
    // Validar se o remetente é participante da conversa
    if (!this.isParticipant(message.senderId.value)) {
      throw new MessageValidationException('Sender is not a participant in this conversation');
    }

    // Validar se o receptor é participante (para mensagens diretas)
    if (!this._isGroup && !this.isParticipant(message.receiverId.value)) {
      throw new MessageValidationException('Receiver is not a participant in this conversation');
    }

    this._messages.push(message);
    this._lastMessage = message;
    this._updatedAt = Timestamp.create();
    
    // Adicionar eventos da mensagem aos eventos da conversa
  }

  addParticipant(userId: string): void {
    if (this.isParticipant(userId)) {
      throw new Error('User is already a participant');
    }

    if (!this._isGroup) {
      throw new Error('Cannot add participants to direct conversation');
    }

    const participant: Participant = {
      userId,
      joinedAt: Timestamp.create(),
      isActive: true
    };

    this._participants.set(userId, participant);
    this._updatedAt = Timestamp.create();
  }

  removeParticipant(userId: string): void {
    if (!this.isParticipant(userId)) {
      throw new Error('User is not a participant');
    }

    if (!this._isGroup) {
      throw new Error('Cannot remove participants from direct conversation');
    }

    if (this._participants.size <= 2) {
      throw new Error('Group must have at least 2 participants');
    }

    this._participants.delete(userId);
    this._updatedAt = Timestamp.create();
  }

  markUserTyping(userId: string): void {
    if (!this.isParticipant(userId)) {
      throw new Error('User is not a participant');
    }

    this._typingUsers.add(userId);
    this._updatedAt = Timestamp.create();
    
  }

  markUserStoppedTyping(userId: string): void {
    if (!this.isParticipant(userId)) {
      throw new Error('User is not a participant');
    }

    this._typingUsers.delete(userId);
    this._updatedAt = Timestamp.create();
  }

  updateUserStatus(userId: string, isActive: boolean, lastSeen?: Timestamp): void {
    const participant = this._participants.get(userId);
    if (!participant) {
      throw new Error('User is not a participant');
    }

    participant.isActive = isActive;
    if (lastSeen) {
      participant.lastSeen = lastSeen;
    }
    
    this._updatedAt = Timestamp.create();
  }

  getMessages(
    limit: number = 50,
    before?: MessageId
  ): { messages: Message[], hasMore: boolean } {
    let filteredMessages = this._messages;
    
    if (before) {
      const beforeIndex = this._messages.findIndex(msg => msg.id.equals(before));
      if (beforeIndex !== -1) {
        filteredMessages = this._messages.slice(0, beforeIndex);
      }
    }
    
    const messages = filteredMessages.slice(-limit);
    const hasMore = filteredMessages.length > limit;
    
    return { messages, hasMore };
  }

  getUnreadCount(userId: string): number {
    return this._messages.filter(
      message => 
        !message.isFromUser(userId) && 
        message.status !== 'read'
    ).length;
  }

  // Getters
  get roomId(): ChatRoomId { return this._roomId; }
  get participants(): Participant[] { return Array.from(this._participants.values()); }
  get messages(): Message[] { return [...this._messages]; }
  get lastMessage(): Message | undefined { return this._lastMessage; }
  get createdAt(): Timestamp { return this._createdAt; }
  get updatedAt(): Timestamp { return this._updatedAt; }
  get typingUsers(): string[] { return Array.from(this._typingUsers); }
  get events(): any[] { return [...this._events]; }
  get isGroup(): boolean { return this._isGroup; }
  get metadata(): Record<string, any> { return { ...this._metadata }; }

  private addEvent(event: any): void {
    this._events.push(event);
  }

  clearEvents(): void {
    this._events = [];
  }

  isParticipant(userId: string): boolean {
    return this._participants.has(userId);
  }

  private validate(): void {
    if (this._participants.size < 2) {
      throw new Error('Conversation must have at least 2 participants');
    }

    if (!this._isGroup && this._participants.size > 2) {
      throw new Error('Direct conversation can only have 2 participants');
    }
  }
}