import { Message, MessageStatus } from '../../../domain/entities/Message';
import { Conversation, Participant } from '../../../domain/entities/Conversation';


const MessageId = require('../../domain/value-objects/MessageId').MessageId;
const Content = require('../../domain/value-objects/Content').Content;
const SenderId = require('../../domain/value-objects/SenderId').SenderId;
const ReceiverId = require('../../domain/value-objects/ReceiverId').ReceiverId;
const ChatRoomId = require('../../domain/value-objects/ChatRoomId').ChatRoomId;
const Timestamp = require('../../domain/value-objects/Timestamp').Timestamp;

// Interfaces para as entidades do banco de dados PostgreSQL
export interface MessageEntity {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    room_id: string;
    status: MessageStatus;
    sent_at: Date;
    delivered_at?: Date;
    read_at?: Date;
    reply_to?: string;
    metadata: Record<string, any>;
    deleted_for: string[];
    created_at: Date;
    updated_at: Date;
}

export interface ConversationEntity {
    id: string;
    is_group: boolean;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    last_message_id?: string;
}

export interface ParticipantEntity {
    conversation_id: string;
    user_id: string;
    joined_at: Date;
    is_active: boolean;
    last_seen?: Date;
    role: string;
}

export class ChatEntityMapper {

    // ========== MAPPERS PARA MENSAGENS ==========

    /**
     * Mapeia uma Message do domínio para uma MessageEntity do PostgreSQL
     */
    static toMessageEntity(message: Message): MessageEntity {
        return {
            id: message.id.value,
            content: message.content.value,
            sender_id: message.senderId.value,
            receiver_id: message.receiverId.value,
            room_id: message.roomId.value,
            status: message.status,
            sent_at: message.sentAt.value,
            delivered_at: message.deliveredAt?.value,
            read_at: message.readAt?.value,
            reply_to: message.replyTo?.value,
            metadata: message.metadata,
            deleted_for: message.metadata.deletedFor || [],
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    /**
     * Mapeia uma MessageEntity do PostgreSQL para uma Message do domínio
     */
    static toMessageDomain(entity: MessageEntity): Message {
        return Message.restore(
            MessageId.create(entity.id),
            Content.create(entity.content),
            SenderId.create(entity.sender_id),
            ReceiverId.create(entity.receiver_id),
            ChatRoomId.create(entity.room_id),
            entity.status,
            Timestamp.create(entity.sent_at),
            entity.delivered_at ? Timestamp.create(entity.delivered_at) : undefined,
            entity.read_at ? Timestamp.create(entity.read_at) : undefined,
            entity.reply_to ? MessageId.create(entity.reply_to) : undefined,
            {
                ...entity.metadata,
                deletedFor: entity.deleted_for
            }
        );
    }

    /**
     * Mapeia um array de MessageEntity para array de Message
     */
    static toMessagesDomain(entities: MessageEntity[]): Message[] {
        return entities.map(entity => this.toMessageDomain(entity));
    }

    // ========== MAPPERS PARA CONVERSAS ==========

    /**
     * Mapeia uma Conversation do domínio para uma ConversationEntity do PostgreSQL
     */
    static toConversationEntity(conversation: Conversation): ConversationEntity {
        return {
            id: conversation.roomId.value,
            is_group: conversation.isGroup,
            metadata: {
                ...conversation.metadata,
                typingUsers: Array.from(conversation.typingUsers)
            },
            created_at: conversation.createdAt.value,
            updated_at: conversation.updatedAt.value,
            last_message_id: conversation.lastMessage?.id.value
        };
    }

    /**
     * Mapeia uma ConversationEntity do PostgreSQL para uma Conversation do domínio
     * Nota: Requer participantes e mensagens separados
     */
    static toConversationDomain(
        entity: ConversationEntity,
        participants: Participant[],
        messages: Message[]
    ): Conversation {
        const metadata = { ...entity.metadata };
        const typingUsers = new Set(metadata.typingUsers || []);
        delete metadata.typingUsers;

        const conversation = Conversation.restore(
            ChatRoomId.create(entity.id),
            participants,
            messages,
            entity.is_group,
            Timestamp.create(entity.created_at),
            Timestamp.create(entity.updated_at),
            metadata
        );

        // Restaurar typing users
        typingUsers.forEach(userId => {
            try {
                conversation.markUserTyping(userId);
            } catch (error) {
                // Ignorar se o usuário não for participante
            }
        });

        return conversation;
    }

    // ========== MAPPERS PARA PARTICIPANTES ==========

    /**
     * Mapeia um Participant do domínio para uma ParticipantEntity do PostgreSQL
     */
    static toParticipantEntity(
        conversationId: string,
        participant: Participant
    ): ParticipantEntity {
        return {
            conversation_id: conversationId,
            user_id: participant.userId,
            joined_at: participant.joinedAt.value,
            is_active: participant.isActive,
            last_seen: participant.lastSeen?.value,
            role: 'member'
        };
    }

    /**
     * Mapeia uma ParticipantEntity do PostgreSQL para um Participant do domínio
     */
    static toParticipantDomain(entity: ParticipantEntity): Participant {
        return {
            userId: entity.user_id,
            joinedAt: Timestamp.create(entity.joined_at),
            isActive: entity.is_active,
            lastSeen: entity.last_seen ? Timestamp.create(entity.last_seen) : undefined
        };
    }

    /**
     * Mapeia um array de ParticipantEntity para array de Participant
     */
    static toParticipantsDomain(entities: ParticipantEntity[]): Participant[] {
        return entities.map(entity => this.toParticipantDomain(entity));
    }

    // ========== MAPPERS PARA QUERIES ESPECÍFICAS ==========

    /**
     * Mapeia resultados de queries JOIN para objetos combinados
     */
    static toConversationWithParticipants(
        conversationEntity: ConversationEntity,
        participantEntities: ParticipantEntity[]
    ): {
        conversation: ConversationEntity;
        participants: Participant[];
    } {
        return {
            conversation: conversationEntity,
            participants: this.toParticipantsDomain(participantEntities)
        };
    }

    /**
     * Mapeia para DTOs de relatório/estatísticas
     */
    static toMessageStatistics(
        messageEntities: MessageEntity[],
        period: 'day' | 'week' | 'month'
    ): {
        period: string;
        totalMessages: number;
        sentMessages: number;
        deliveredMessages: number;
        readMessages: number;
        averageDeliveryTime: number;
        averageReadTime: number;
        topSenders: Array<{ userId: string; count: number }>;
        topRooms: Array<{ roomId: string; count: number }>;
    } {
        const totalMessages = messageEntities.length;
        const sentMessages = messageEntities.filter(m => m.status === 'sent').length;
        const deliveredMessages = messageEntities.filter(m => m.status === 'delivered').length;
        const readMessages = messageEntities.filter(m => m.status === 'read').length;

        // Calcular tempos médios
        const messagesWithDelivery = messageEntities.filter(m => m.delivered_at);
        const messagesWithRead = messageEntities.filter(m => m.read_at);

        const averageDeliveryTime = messagesWithDelivery.length > 0
            ? messagesWithDelivery.reduce((acc, m) => {
                const deliveryTime = m.delivered_at!.getTime() - m.sent_at.getTime();
                return acc + deliveryTime;
            }, 0) / messagesWithDelivery.length
            : 0;

        const averageReadTime = messagesWithRead.length > 0
            ? messagesWithRead.reduce((acc, m) => {
                const readTime = m.read_at!.getTime() - m.sent_at.getTime();
                return acc + readTime;
            }, 0) / messagesWithRead.length
            : 0;

        // Top senders
        const senderCounts = messageEntities.reduce((acc, message) => {
            acc[message.sender_id] = (acc[message.sender_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topSenders = Object.entries(senderCounts)
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Top rooms
        const roomCounts = messageEntities.reduce((acc, message) => {
            acc[message.room_id] = (acc[message.room_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topRooms = Object.entries(roomCounts)
            .map(([roomId, count]) => ({ roomId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            period,
            totalMessages,
            sentMessages,
            deliveredMessages,
            readMessages,
            averageDeliveryTime,
            averageReadTime,
            topSenders,
            topRooms
        };
    }

    /**
     * Mapeia para DTO de resumo de conversa
     */
    static toConversationSummary(
        conversationEntity: ConversationEntity,
        participants: Participant[],
        lastMessage?: MessageEntity,
        unreadCount: number = 0
    ): {
        roomId: string;
        isGroup: boolean;
        participants: string[];
        lastMessage?: {
            id: string;
            content: string;
            senderId: string;
            sentAt: Date;
            status: MessageStatus;
        };
        unreadCount: number;
        updatedAt: Date;
        metadata: Record<string, any>;
    } {
        return {
            roomId: conversationEntity.id,
            isGroup: conversationEntity.is_group,
            participants: participants.map(p => p.userId),
            lastMessage: lastMessage ? {
                id: lastMessage.id,
                content: lastMessage.content.length > 100
                    ? lastMessage.content.substring(0, 100) + '...'
                    : lastMessage.content,
                senderId: lastMessage.sender_id,
                sentAt: lastMessage.sent_at,
                status: lastMessage.status
            } : undefined,
            unreadCount,
            updatedAt: conversationEntity.updated_at,
            metadata: conversationEntity.metadata
        };
    }

    /**
     * Mapeia para DTO de histórico de mensagens com paginação
     */
    static toPaginatedMessages(
        messageEntities: MessageEntity[],
        total: number,
        page: number,
        pageSize: number
    ): {
        messages: Array<{
            id: string;
            content: string;
            senderId: string;
            receiverId: string;
            roomId: string;
            status: MessageStatus;
            sentAt: Date;
            deliveredAt?: Date;
            readAt?: Date;
            replyTo?: string;
            metadata: Record<string, any>;
        }>;
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    } {
        const totalPages = Math.ceil(total / pageSize);

        return {
            messages: messageEntities.map(entity => ({
                id: entity.id,
                content: entity.content,
                senderId: entity.sender_id,
                receiverId: entity.receiver_id,
                roomId: entity.room_id,
                status: entity.status,
                sentAt: entity.sent_at,
                deliveredAt: entity.delivered_at,
                readAt: entity.read_at,
                replyTo: entity.reply_to,
                metadata: entity.metadata
            })),
            pagination: {
                total,
                page,
                pageSize,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            }
        };
    }




    // ========== VALIDATORS ==========

    /**
     * Valida se uma MessageEntity é válida
     */
    static isValidMessageEntity(entity: any): boolean {
        if (!entity || typeof entity !== 'object') return false;

        const requiredFields = ['id', 'content', 'sender_id', 'receiver_id', 'room_id', 'status', 'sent_at'];
        for (const field of requiredFields) {
            if (!entity[field]) return false;
        }

        // Validar status
        if (!['sent', 'delivered', 'read', 'failed'].includes(entity.status)) {
            return false;
        }

        // Validar datas
        if (isNaN(new Date(entity.sent_at).getTime())) return false;
        if (entity.delivered_at && isNaN(new Date(entity.delivered_at).getTime())) return false;
        if (entity.read_at && isNaN(new Date(entity.read_at).getTime())) return false;

        return true;
    }

    /**
     * Valida se uma ConversationEntity é válida
     */
    static isValidConversationEntity(entity: any): boolean {
        if (!entity || typeof entity !== 'object') return false;

        const requiredFields = ['id', 'is_group', 'created_at', 'updated_at'];
        for (const field of requiredFields) {
            if (entity[field] === undefined || entity[field] === null) return false;
        }

        // Validar datas
        if (isNaN(new Date(entity.created_at).getTime())) return false;
        if (isNaN(new Date(entity.updated_at).getTime())) return false;

        return true;
    }

    /**
     * Valida se um ParticipantEntity é válido
     */
    static isValidParticipantEntity(entity: any): boolean {
        if (!entity || typeof entity !== 'object') return false;

        const requiredFields = ['conversation_id', 'user_id', 'joined_at', 'is_active'];
        for (const field of requiredFields) {
            if (!entity[field]) return false;
        }

        // Validar data
        if (isNaN(new Date(entity.joined_at).getTime())) return false;
        if (entity.last_seen && isNaN(new Date(entity.last_seen).getTime())) return false;

        return true;
    }

    // ========== UTILITÁRIOS ==========

    /**
     * Gera uma MessageEntity a partir de dados brutos (útil para testes)
     */
    static createMockMessageEntity(overrides: Partial<MessageEntity> = {}): MessageEntity {
        const now = new Date();
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            id,
            content: 'Test message content',
            sender_id: 'user_1',
            receiver_id: 'user_2',
            room_id: 'direct_user_1_user_2',
            status: 'sent',
            sent_at: now,
            delivered_at: undefined,
            read_at: undefined,
            reply_to: undefined,
            metadata: {},
            deleted_for: [],
            created_at: now,
            updated_at: now,
            ...overrides
        };
    }

    /**
     * Gera uma ConversationEntity a partir de dados brutos (útil para testes)
     */
    static createMockConversationEntity(overrides: Partial<ConversationEntity> = {}): ConversationEntity {
        const now = new Date();
        const id = `direct_user_1_user_2`;

        return {
            id,
            is_group: false,
            metadata: {},
            created_at: now,
            updated_at: now,
            last_message_id: undefined,
            ...overrides
        };
    }

    /**
     * Gera um ParticipantEntity a partir de dados brutos (útil para testes)
     */
    static createMockParticipantEntity(
        conversationId: string,
        userId: string,
        overrides: Partial<ParticipantEntity> = {}
    ): ParticipantEntity {
        const now = new Date();

        return {
            conversation_id: conversationId,
            user_id: userId,
            joined_at: now,
            is_active: true,
            last_seen: undefined,
            role: 'member',
            ...overrides
        };
    }

    /**
     * Normaliza metadados para evitar problemas de serialização
     */
    static normalizeMetadata(metadata: Record<string, any>): Record<string, any> {
        if (!metadata || typeof metadata !== 'object') {
            return {};
        }

        // Remover campos undefined
        const normalized = { ...metadata };
        Object.keys(normalized).forEach(key => {
            if (normalized[key] === undefined) {
                delete normalized[key];
            }
        });

        return normalized;
    }

    /**
     * Calcula diferença de tempo entre dois timestamps em segundos
     */
    static calculateTimeDifference(start: Date, end: Date): number {
        return Math.abs(end.getTime() - start.getTime()) / 1000;
    }

    /**
     * Formata data para exibição amigável
     */
    static formatDateForDisplay(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
            return 'agora mesmo';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} min atrás`;
        } else if (diffHours < 24) {
            return `${diffHours} h atrás`;
        } else if (diffDays < 7) {
            return `${diffDays} d atrás`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Tipos auxiliares para queries
export type ConversationWithParticipants = ReturnType<
    typeof ChatEntityMapper.toConversationWithParticipants
>;

export type MessageStatistics = ReturnType<
    typeof ChatEntityMapper.toMessageStatistics
>;

export type ConversationSummary = ReturnType<
    typeof ChatEntityMapper.toConversationSummary
>;

export type PaginatedMessages = ReturnType<
    typeof ChatEntityMapper.toPaginatedMessages
>;

export default ChatEntityMapper;