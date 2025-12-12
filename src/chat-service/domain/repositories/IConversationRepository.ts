import { Conversation } from '../entities/Conversation';
import { ChatRoomId } from '../value-objects/ChatRoomId';

export interface ConversationSearchCriteria {
  participantId?: string;
  isGroup?: boolean;
  hasUnreadMessages?: boolean;
  lastMessageAfter?: Date;
  lastMessageBefore?: Date;
}

export interface IConversationRepository {
  // Operações básicas de CRUD
  save(conversation: Conversation): Promise<void>;
  findById(roomId: ChatRoomId): Promise<Conversation | null>;
  update(conversation: Conversation): Promise<void>;
  delete(roomId: ChatRoomId): Promise<void>;
  
  // Buscas por participante
  findByParticipant(userId: string): Promise<Conversation[]>;
  findByParticipants(userId1: string, userId2: string): Promise<Conversation | null>;
  
  // Buscas avançadas
  search(criteria: ConversationSearchCriteria): Promise<Conversation[]>;
  
  // Operações de participante
  addParticipant(roomId: ChatRoomId, userId: string): Promise<void>;
  removeParticipant(roomId: ChatRoomId, userId: string): Promise<void>;
  updateParticipantStatus(roomId: ChatRoomId, userId: string, isActive: boolean): Promise<void>;
  
  // Estatísticas
  countByParticipant(userId: string): Promise<number>;
  countUnreadConversations(userId: string): Promise<number>;
  
  // Operações de mensagens
  addMessage(roomId: ChatRoomId, message: any): Promise<void>;
  getLastMessage(roomId: ChatRoomId): Promise<any | null>;
  
  // Limpeza e manutenção
  archiveOldConversations(days: number): Promise<number>;
  
  // Verificações
  exists(roomId: ChatRoomId): Promise<boolean>;
  isParticipant(roomId: ChatRoomId, userId: string): Promise<boolean>;
  
  // Buscas paginadas
  findPaginatedByParticipant(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Atualizações em lote
  updateLastSeen(userId: string, roomIds: ChatRoomId[]): Promise<void>;
  markAllAsRead(userId: string, roomId: ChatRoomId): Promise<void>;
}