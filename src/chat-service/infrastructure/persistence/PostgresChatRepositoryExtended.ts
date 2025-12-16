import { DatabaseConnection } from '../database/DatabaseConnection';
import { MessageId } from '../../domain/value-objects/MessageId';
import { ChatRoomId } from '../../domain/value-objects/ChatRoomId';
import { Message } from '../../domain/entities/Message';
import { Conversation } from '../../domain/entities/Conversation';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { ChatEntityMapper } from './mappers/ChatEntityMapper';

export class PostgresChatRepositoryExtended implements IMessageRepository, IConversationRepository {
    constructor(private readonly db: DatabaseConnection) {}

    // Message-specific implementations (renamed to avoid name collisions)
    async saveMessage(message: Message): Promise<void> {
        const data = ChatEntityMapper.toMessageTable(message);
        await this.db.query(
            `INSERT INTO messages (id, content, sender_id, receiver_id, chat_room_id, sent_at, read_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [data.id, data.content, data.sender_id, data.receiver_id, data.chat_room_id, data.sent_at, data.read_at]
        );
    }

    async findMessageById(id: MessageId): Promise<Message | null> {
        const result = await this.db.query(
            'SELECT * FROM messages WHERE id = $1',
            [id.value]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return ChatEntityMapper.toMessageEntity(result.rows[0]);
    }

    async findByChatRoomId(chatRoomId: ChatRoomId): Promise<Message[]> {
        const result = await this.db.query(
            'SELECT * FROM messages WHERE chat_room_id = $1 ORDER BY sent_at ASC',
            [chatRoomId.value]
        );
        
        return result.rows.map((row: any) => ChatEntityMapper.toMessageEntity(row));
    }

    async findUnreadByReceiverId(receiverId: string): Promise<Message[]> {
        const result = await this.db.query(
            'SELECT * FROM messages WHERE receiver_id = $1 AND read_at IS NULL ORDER BY sent_at ASC',
            [receiverId]
        );
        
        return result.rows.map((row: any) => ChatEntityMapper.toMessageEntity(row));
    }

    async updateMessage(message: Message): Promise<void> {
        const data = ChatEntityMapper.toMessageTable(message);
        await this.db.query(
            `UPDATE messages SET content = $2, read_at = $3 WHERE id = $1`,
            [data.id, data.content, data.read_at]
        );
    }

    async deleteMessage(id: MessageId): Promise<void> {
        await this.db.query(
            'DELETE FROM messages WHERE id = $1',
            [id.value]
        );
    }

    // Conversation-specific implementations
    async saveConversation(conversation: Conversation): Promise<void> {
        const data = ChatEntityMapper.toConversationTable(conversation);
        await this.db.query(
            `INSERT INTO conversations (id, participants, last_message_at)
             VALUES ($1, $2, $3)`,
            [data.id, data.participants, data.last_message_at]
        );
    }

    async findByIdConversation(id: ChatRoomId): Promise<Conversation | null> {
        const result = await this.db.query(
            'SELECT * FROM conversations WHERE id = $1',
            [id.value]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return ChatEntityMapper.toConversationEntity(result.rows[0]);
    }

    async findByParticipant(userId: string): Promise<Conversation[]> {
        const result = await this.db.query(
            'SELECT * FROM conversations WHERE participants @> ARRAY[$1]::text[] ORDER BY last_message_at DESC',
            [userId]
        );
        
        return result.rows.map((row: any) => ChatEntityMapper.toConversationEntity(row));
    }

    async exists(id: ChatRoomId): Promise<boolean> {
        const result = await this.db.query(
            'SELECT 1 FROM conversations WHERE id = $1',
            [id.value]
        );
        
        return result.rows.length > 0;
    }

    async updateConversation(conversation: Conversation): Promise<void> {
        const data = ChatEntityMapper.toConversationTable(conversation);
        await this.db.query(
            `UPDATE conversations SET participants = $2, last_message_at = $3 WHERE id = $1`,
            [data.id, data.participants, data.last_message_at]
        );
    }

    async deleteConversation(id: ChatRoomId): Promise<void> {
        await this.db.beginTransaction();
        try {
            await this.db.query('DELETE FROM messages WHERE chat_room_id = $1', [id.value]);
            await this.db.query('DELETE FROM conversations WHERE id = $1', [id.value]);
            await this.db.commit();
        } catch (error) {
            await this.db.rollback();
            throw error;
        }
    }

    // Overloads and dispatcher implementations to satisfy both interfaces without duplicate method bodies
    async save(entity: Message): Promise<void>;
    async save(entity: Conversation): Promise<void>;
    async save(entity: any): Promise<void> {
        if (entity instanceof Message) {
            return this.saveMessage(entity);
        }
        return this.saveConversation(entity);
    }

    async findById(id: MessageId): Promise<Message | null>;
    async findById(id: ChatRoomId): Promise<Conversation | null>;
    async findById(id: any): Promise<any> {
        if (id instanceof MessageId) {
            return this.findMessageById(id);
        }
        return this.findByIdConversation(id);
    }

    async update(entity: Message): Promise<void>;
    async update(entity: Conversation): Promise<void>;
    async update(entity: any): Promise<void> {
        if (entity instanceof Message) {
            return this.updateMessage(entity);
        }
        return this.updateConversation(entity);
    }

    async delete(id: MessageId): Promise<void>;
    async delete(id: ChatRoomId): Promise<void>;
    async delete(id: any): Promise<void> {
        if (id instanceof MessageId) {
            return this.deleteMessage(id);
        }
        return this.deleteConversation(id);
    }
}