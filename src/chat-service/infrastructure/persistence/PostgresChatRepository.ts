import { Pool } from "pg";
import {
  IMessageRepository,
  MessageSearchCriteria,
} from "../../domain/repositories/IMessageRepository";
// /domain/repositories/IMessageRepository
import { Message } from "../../domain/entities/Message";
import { MessageId } from "../../domain/value-objects/MessageId";
import { ChatRoomId } from "../../domain/value-objects/ChatRoomId";
import { SenderId } from "../../domain/value-objects/SenderId";
import { MessageStatus } from "../../domain/entities/Message";
import { ChatEntityMapper, MessageEntity } from "./mappers/ChatEntityMapper";

export class PostgresChatRepository implements IMessageRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
    this.initializeTable();
  }

  private async initializeTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(100) PRIMARY KEY,
        content TEXT NOT NULL,
        sender_id VARCHAR(100) NOT NULL,
        receiver_id VARCHAR(100) NOT NULL,
        room_id VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
        sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
        delivered_at TIMESTAMP WITH TIME ZONE,
        read_at TIMESTAMP WITH TIME ZONE,
        reply_to VARCHAR(100),
        metadata JSONB DEFAULT '{}'::jsonb,
        deleted_for TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
      CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_room_sent ON messages(room_id, sent_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_deleted_for ON messages USING GIN (deleted_for);
      CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING GIN (metadata);
    `;

    try {
      await this.pool.query(createTableQuery);
      await this.pool.query(createIndexesQuery);
      console.log("Messages table initialized");
    } catch (error) {
      console.error("Error initializing messages table:", error);
      throw error;
    }
  }

  async save(message: Message): Promise<void> {
    const entity = ChatEntityMapper.toMessageEntity(message);

    const query = `
      INSERT INTO messages (
        id, content, sender_id, receiver_id, room_id, status,
        sent_at, delivered_at, read_at, reply_to, metadata, deleted_for
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        status = EXCLUDED.status,
        delivered_at = EXCLUDED.delivered_at,
        read_at = EXCLUDED.read_at,
        metadata = EXCLUDED.metadata,
        deleted_for = EXCLUDED.deleted_for,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.pool.query(query, [
      entity.id,
      entity.content,
      entity.sender_id,
      entity.receiver_id,
      entity.room_id,
      entity.status,
      entity.sent_at,
      entity.delivered_at,
      entity.read_at,
      entity.reply_to,
      JSON.stringify(entity.metadata),
      entity.deleted_for,
    ]);
  }

  async findById(id: MessageId): Promise<Message | null> {
    const query = "SELECT * FROM messages WHERE id = $1";
    const result = await this.pool.query<MessageEntity>(query, [id.value]);

    return result.rows.length > 0
      ? ChatEntityMapper.toMessageDomain(result.rows[0])
      : null;
  }

  async update(message: Message): Promise<void> {
    await this.save(message);
  }

  async delete(id: MessageId): Promise<void> {
    const query = "DELETE FROM messages WHERE id = $1";
    await this.pool.query(query, [id.value]);
  }

  async findByRoomId(
    roomId: ChatRoomId,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE room_id = $1 
        AND NOT ($2 = ANY(deleted_for))
      ORDER BY sent_at DESC 
      LIMIT $3 OFFSET $4
    `;

    const result = await this.pool.query<MessageEntity>(query, [
      roomId.value,
      "system",
      limit,
      offset,
    ]);

    return ChatEntityMapper.toMessagesDomain(result.rows).reverse();
  }

  async findBySenderId(senderId: SenderId): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE sender_id = $1 
      ORDER BY sent_at DESC
    `;

    const result = await this.pool.query<MessageEntity>(query, [
      senderId.value,
    ]);
    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async findByReceiverId(receiverId: string): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE receiver_id = $1 
        AND status = 'sent'
        AND NOT ($1 = ANY(deleted_for))
      ORDER BY sent_at DESC
    `;

    const result = await this.pool.query<MessageEntity>(query, [receiverId]);
    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async search(criteria: MessageSearchCriteria): Promise<Message[]> {
    const conditions: string[] = ["1 = 1"];
    const params: any[] = [];
    let paramCount = 1;

    if (criteria.roomId) {
      conditions.push(`room_id = $${paramCount}`);
      params.push(criteria.roomId.value);
      paramCount++;
    }

    if (criteria.senderId) {
      conditions.push(`sender_id = $${paramCount}`);
      params.push(criteria.senderId.value);
      paramCount++;
    }

    if (criteria.startDate) {
      conditions.push(`sent_at >= $${paramCount}`);
      params.push(criteria.startDate.toISOString());
      paramCount++;
    }

    if (criteria.endDate) {
      conditions.push(`sent_at <= $${paramCount}`);
      params.push(criteria.endDate.toISOString());
      paramCount++;
    }

    if (criteria.containsText) {
      conditions.push(`content ILIKE $${paramCount}`);
      params.push(`%${criteria.containsText}%`);
      paramCount++;
    }

    if (criteria.status) {
      conditions.push(`status = $${paramCount}`);
      params.push(criteria.status);
      paramCount++;
    }

    const limit = criteria.limit || 50;
    const offset = criteria.offset || 0;

    const query = `
      SELECT * FROM messages 
      WHERE ${conditions.join(" AND ")}
      ORDER BY sent_at DESC 
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);
    const result = await this.pool.query<MessageEntity>(query, params);

    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async countByRoom(roomId: ChatRoomId): Promise<number> {
    const query = `
      SELECT COUNT(*) FROM messages 
      WHERE room_id = $1 
        AND (deleted_for IS NULL OR array_length(deleted_for, 1) = 0)
    `;

    const result = await this.pool.query<{ count: string }>(query, [
      roomId.value,
    ]);
    return parseInt(result.rows[0].count, 10);
  }

  async countUnreadByUser(
    userId: string,
    roomId?: ChatRoomId
  ): Promise<number> {
    let query = `
      SELECT COUNT(*) FROM messages 
      WHERE receiver_id = $1 
        AND status IN ('sent', 'delivered')
        AND (deleted_for IS NULL OR NOT $1 = ANY(deleted_for))
    `;

    const params: any[] = [userId];

    if (roomId) {
      query += ` AND room_id = $2`;
      params.push(roomId.value);
    }

    const result = await this.pool.query<{ count: string }>(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async saveMany(messages: Message[]): Promise<void> {
    if (messages.length === 0) return;

    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      for (const message of messages) {
        const entity = ChatEntityMapper.toMessageEntity(message);
        const query = `
          INSERT INTO messages (
            id, content, sender_id, receiver_id, room_id, status,
            sent_at, delivered_at, read_at, reply_to, metadata, deleted_for
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            content = EXCLUDED.content,
            status = EXCLUDED.status,
            delivered_at = EXCLUDED.delivered_at,
            read_at = EXCLUDED.read_at,
            metadata = EXCLUDED.metadata,
            deleted_for = EXCLUDED.deleted_for
        `;

        await client.query(query, [
          entity.id,
          entity.content,
          entity.sender_id,
          entity.receiver_id,
          entity.room_id,
          entity.status,
          entity.sent_at,
          entity.delivered_at,
          entity.read_at,
          entity.reply_to,
          JSON.stringify(entity.metadata),
          entity.deleted_for,
        ]);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateMany(messages: Message[]): Promise<void> {
    await this.saveMany(messages);
  }

  async markAsDelivered(messageId: MessageId): Promise<void> {
    const query = `
      UPDATE messages 
      SET status = 'delivered', 
          delivered_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [messageId.value]);
  }

  async markAsRead(messageId: MessageId): Promise<void> {
    const query = `
      UPDATE messages 
      SET status = 'read', 
          read_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [messageId.value]);
  }

  async markManyAsRead(messageIds: MessageId[]): Promise<void> {
    if (messageIds.length === 0) return;

    const ids = messageIds.map((id) => id.value);
    const query = `
      UPDATE messages 
      SET status = 'read', 
          read_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1)
    `;

    await this.pool.query(query, [ids]);
  }

  async deleteOldMessages(retentionDays: number): Promise<number> {
    const query = `
      DELETE FROM messages 
      WHERE sent_at < CURRENT_TIMESTAMP - INTERVAL '${retentionDays} days'
        AND (metadata->>'keepForever')::boolean IS NOT TRUE
      RETURNING id
    `;

    const result = await this.pool.query(query);
    return result.rowCount ?? 0;
  }

  async archiveMessages(roomId: ChatRoomId): Promise<void> {
    const query = `
      UPDATE messages 
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{archived}',
        'true'::jsonb
      )
      WHERE room_id = $1
    `;

    await this.pool.query(query, [roomId.value]);
  }

  async findPaginated(
    roomId: ChatRoomId,
    page: number,
    pageSize: number
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * pageSize;

    const [countResult, messagesResult] = await Promise.all([
      this.pool.query<{ count: string }>(
        "SELECT COUNT(*) FROM messages WHERE room_id = $1",
        [roomId.value]
      ),
      this.pool.query<MessageEntity>(
        `SELECT * FROM messages 
         WHERE room_id = $1 
         ORDER BY sent_at DESC 
         LIMIT $2 OFFSET $3`,
        [roomId.value, pageSize, offset]
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const messages = ChatEntityMapper.toMessagesDomain(
      messagesResult.rows
    ).reverse();
    const totalPages = Math.ceil(total / pageSize);

    return {
      messages,
      total,
      page,
      totalPages,
    };
  }

  async findMessagesBetween(
    roomId: ChatRoomId,
    startDate: Date,
    endDate: Date
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE room_id = $1 
        AND sent_at BETWEEN $2 AND $3
      ORDER BY sent_at ASC
    `;

    const result = await this.pool.query<MessageEntity>(query, [
      roomId.value,
      startDate.toISOString(),
      endDate.toISOString(),
    ]);

    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async exists(id: MessageId): Promise<boolean> {
    const query = "SELECT 1 FROM messages WHERE id = $1 LIMIT 1";
    const result = await this.pool.query(query, [id.value]);
    return (result.rowCount ?? 0) > 0;
  }

  async hasUnreadMessages(
    userId: string,
    roomId: ChatRoomId
  ): Promise<boolean> {
    const query = `
      SELECT 1 FROM messages 
      WHERE room_id = $1 
        AND receiver_id = $2
        AND status IN ('sent', 'delivered')
      LIMIT 1
    `;

    const result = await this.pool.query(query, [roomId.value, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async findMessagesBefore(
    roomId: ChatRoomId,
    beforeMessageId: MessageId,
    limit: number
  ): Promise<Message[]> {
    const beforeMessage = await this.findById(beforeMessageId);
    if (!beforeMessage) {
      return [];
    }

    const query = `
      SELECT * FROM messages 
      WHERE room_id = $1 
        AND sent_at < $2
      ORDER BY sent_at DESC 
      LIMIT $3
    `;

    const result = await this.pool.query<MessageEntity>(query, [
      roomId.value,
      beforeMessage.sentAt.isoString,
      limit,
    ]);

    return ChatEntityMapper.toMessagesDomain(result.rows).reverse();
  }

  // Métodos adicionais específicos do PostgreSQL
  async searchFullText(query: string, roomId?: string): Promise<Message[]> {
    const conditions: string[] = [];
    const params: any[] = [query];
    let paramCount = 2;

    if (roomId) {
      conditions.push(`room_id = $${paramCount}`);
      params.push(roomId);
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")} AND` : "WHERE";

    const sqlQuery = `
      SELECT * FROM messages 
      ${whereClause} to_tsvector('portuguese', content) @@ plainto_tsquery('portuguese', $1)
      ORDER BY ts_rank(to_tsvector('portuguese', content), plainto_tsquery('portuguese', $1)) DESC
      LIMIT 50
    `;

    const result = await this.pool.query<MessageEntity>(sqlQuery, params);
    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async softDeleteForUser(messageId: MessageId, userId: string): Promise<void> {
    const query = `
      UPDATE messages 
      SET deleted_for = array_append(
        COALESCE(deleted_for, ARRAY[]::TEXT[]),
        $1
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.pool.query(query, [userId, messageId.value]);
  }

  async getMessageStatsByRoom(roomId: ChatRoomId): Promise<{
    total: number;
    unread: number;
    lastMessageAt: Date | null;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('sent', 'delivered') THEN 1 END) as unread,
        MAX(sent_at) as last_message_at
      FROM messages 
      WHERE room_id = $1
    `;

    const result = await this.pool.query<{
      total: string;
      unread: string;
      last_message_at: Date | null;
    }>(query, [roomId.value]);

    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      unread: parseInt(row.unread, 10),
      lastMessageAt: row.last_message_at,
    };
  }

  async getMessagesByStatus(
    status: MessageStatus,
    limit: number = 100
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE status = $1
      ORDER BY sent_at DESC 
      LIMIT $2
    `;

    const result = await this.pool.query<MessageEntity>(query, [status, limit]);
    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async getRecentMessages(limit: number = 100): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      ORDER BY sent_at DESC 
      LIMIT $1
    `;

    const result = await this.pool.query<MessageEntity>(query, [limit]);
    return ChatEntityMapper.toMessagesDomain(result.rows);
  }

  async cleanupOrphanedMessages(): Promise<number> {
    const query = `
      DELETE FROM messages 
      WHERE NOT EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = messages.room_id
      )
      RETURNING id
    `;

    const result = await this.pool.query(query);
    return result.rowCount ?? 0;
  }

  async getStatistics(): Promise<{
    totalMessages: number;
    messagesToday: number;
    avgMessagesPerUser: number;
    mostActiveRoom: string | null;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queries = await Promise.all([
      this.pool.query("SELECT COUNT(*) as count FROM messages"),
      this.pool.query(
        "SELECT COUNT(*) as count FROM messages WHERE sent_at >= $1",
        [today]
      ),
      this.pool.query(
        "SELECT COUNT(DISTINCT sender_id) as count FROM messages"
      ),
      this.pool.query(`
        SELECT room_id, COUNT(*) as count 
        FROM messages 
        GROUP BY room_id 
        ORDER BY count DESC 
        LIMIT 1
      `),
    ]);

    const totalMessages = parseInt(queries[0].rows[0].count, 10);
    const messagesToday = parseInt(queries[1].rows[0].count, 10);
    const uniqueSenders = parseInt(queries[2].rows[0].count, 10);
    const mostActiveRoom =
      queries[3].rows.length > 0 ? queries[3].rows[0].room_id : null;

    return {
      totalMessages,
      messagesToday,
      avgMessagesPerUser: uniqueSenders > 0 ? totalMessages / uniqueSenders : 0,
      mostActiveRoom,
    };
  }
}
