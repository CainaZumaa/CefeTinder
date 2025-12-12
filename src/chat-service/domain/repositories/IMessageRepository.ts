import { Message } from '../entities/Message';
import { MessageId } from '../value-objects/MessageId';
import { ChatRoomId } from '../value-objects/ChatRoomId';
import { SenderId } from '../value-objects/SenderId';

export interface MessageSearchCriteria {
  roomId?: ChatRoomId;
  senderId?: SenderId;
  startDate?: Date;
  endDate?: Date;
  containsText?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface IMessageRepository {
  // Operações básicas de CRUD
  save(message: Message): Promise<void>;
  findById(id: MessageId): Promise<Message | null>;
  update(message: Message): Promise<void>;
  delete(id: MessageId): Promise<void>;

  // Buscas específicas
  findByRoomId(roomId: ChatRoomId, limit?: number, offset?: number): Promise<Message[]>;
  findBySenderId(senderId: SenderId): Promise<Message[]>;
  findByReceiverId(receiverId: string): Promise<Message[]>;
  
  // Buscas avançadas
  search(criteria: MessageSearchCriteria): Promise<Message[]>;
  
  // Estatísticas
  countByRoom(roomId: ChatRoomId): Promise<number>;
  countUnreadByUser(userId: string, roomId?: ChatRoomId): Promise<number>;
  
  // Operações em lote
  saveMany(messages: Message[]): Promise<void>;
  updateMany(messages: Message[]): Promise<void>;
  
  // Operações de status
  markAsDelivered(messageId: MessageId): Promise<void>;
  markAsRead(messageId: MessageId): Promise<void>;
  markManyAsRead(messageIds: MessageId[]): Promise<void>;
  
  // Limpeza e manutenção
  deleteOldMessages(retentionDays: number): Promise<number>;
  archiveMessages(roomId: ChatRoomId): Promise<void>;
  
  // Buscas paginadas
  findPaginated(
    roomId: ChatRoomId,
    page: number,
    pageSize: number
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Buscas temporais
  findMessagesBetween(
    roomId: ChatRoomId,
    startDate: Date,
    endDate: Date
  ): Promise<Message[]>;
  
  // Verificações
  exists(id: MessageId): Promise<boolean>;
  hasUnreadMessages(userId: string, roomId: ChatRoomId): Promise<boolean>;
}