import { Pool, QueryResult } from "pg";
import {
  ConversationSearchCriteria,
  IConversationRepository,
} from "../../domain/repositories/IConversationRepository";
import { Conversation, Participant } from "../../domain/entities/Conversation";
import { ChatRoomId } from "../../domain/value-objects/ChatRoomId";
import { Timestamp } from "../../domain/value-objects/Timestamp";
import { Message } from "../../domain/entities/Message";
import {
  ChatEntityMapper,
  ConversationEntity,
  ParticipantEntity,
} from "./mappers/ChatEntityMapper";

export class PostgresChatRepositoryExtended implements IConversationRepository {
  private pool: Pool;
  private messageRepository: any;

  constructor(pool: Pool, messageRepository: any) {
    this.pool = pool;
    this.messageRepository = messageRepository;
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    // Tabela de conversas
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(200) PRIMARY KEY,
        is_group BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_message_id VARCHAR(100)
      );
    `;

    // Tabela de participantes
    const createParticipantsTable = `
      CREATE TABLE IF NOT EXISTS conversation_participants (
        conversation_id VARCHAR(200) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        last_seen TIMESTAMP WITH TIME ZONE,
        role VARCHAR(20) DEFAULT 'member',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id),
        CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) 
          REFERENCES conversations(id) ON DELETE CASCADE
      );
    `;

    // Índices
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_conversations_is_group ON conversations(is_group);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_conversations_metadata ON conversations USING GIN (metadata);
      CREATE INDEX IF NOT EXISTS idx_participants_user_id ON conversation_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_participants_conversation_id ON conversation_participants(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_participants_is_active ON conversation_participants(is_active);
    `;

    try {
      await this.pool.query(createConversationsTable);
      await this.pool.query(createParticipantsTable);
      await this.pool.query(createIndexes);
      console.log("Conversation tables initialized");
    } catch (error) {
      console.error("Error initializing conversation tables:", error);
      throw error;
    }
  }

  private async toDomain(conversationId: string): Promise<Conversation | null> {
    try {
      // Buscar conversa
      const convQuery = "SELECT * FROM conversations WHERE id = $1";
      const convResult = await this.pool.query<ConversationEntity>(convQuery, [
        conversationId,
      ]);

      if (convResult.rows.length === 0) {
        return null;
      }

      const convRow = convResult.rows[0];

      // Buscar participantes
      const partQuery =
        "SELECT * FROM conversation_participants WHERE conversation_id = $1";
      const partResult = await this.pool.query<ParticipantEntity>(partQuery, [
        conversationId,
      ]);

      const participants: Participant[] = partResult.rows.map((row) => ({
        userId: row.user_id,
        joinedAt: Timestamp.create(row.joined_at),
        isActive: row.is_active,
        lastSeen: row.last_seen ? Timestamp.create(row.last_seen) : undefined,
      }));

      // Buscar mensagens (limitado para performance)
      const roomId = ChatRoomId.create(conversationId);
      const messages = await this.messageRepository.findByRoomId(
        roomId,
        100,
        0
      );

      return ChatEntityMapper.toConversationDomain(
        convRow,
        participants,
        messages
      );
    } catch (error) {
      console.error("Error converting to domain:", error);
      throw error;
    }
  }

  async save(conversation: Conversation): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Inserir/atualizar conversa
      const convQuery = `
        INSERT INTO conversations (id, is_group, metadata, last_message_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          is_group = EXCLUDED.is_group,
          metadata = EXCLUDED.metadata,
          last_message_id = EXCLUDED.last_message_id,
          updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(convQuery, [
        conversation.roomId.value,
        conversation.isGroup,
        JSON.stringify(conversation.metadata),
        conversation.lastMessage?.id.value,
      ]);

      // Limpar participantes antigos
      await client.query(
        "DELETE FROM conversation_participants WHERE conversation_id = $1",
        [conversation.roomId.value]
      );

      // Inserir novos participantes
      for (const participant of conversation.participants) {
        const partQuery = `
          INSERT INTO conversation_participants 
          (conversation_id, user_id, joined_at, is_active, last_seen, role)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(partQuery, [
          conversation.roomId.value,
          participant.userId,
          participant.joinedAt.isoString,
          participant.isActive,
          participant.lastSeen?.isoString,
          "member",
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

  async findById(roomId: ChatRoomId): Promise<Conversation | null> {
    return this.toDomain(roomId.value);
  }

  async update(conversation: Conversation): Promise<void> {
    await this.save(conversation);
  }

  async delete(roomId: ChatRoomId): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        "DELETE FROM conversation_participants WHERE conversation_id = $1",
        [roomId.value]
      );

      await client.query("DELETE FROM conversations WHERE id = $1", [
        roomId.value,
      ]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findByParticipant(userId: string): Promise<Conversation[]> {
    const query = `
      SELECT c.* 
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC
    `;

    const result = await this.pool.query<ConversationEntity>(query, [userId]);

    const conversations: Conversation[] = [];
    for (const row of result.rows) {
      const conversation = await this.toDomain(row.id);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }

  async findByParticipants(
    userId1: string,
    userId2: string
  ): Promise<Conversation | null> {
    const query = `
      SELECT c.* 
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE c.is_group = FALSE
        AND cp1.user_id = $1
        AND cp2.user_id = $2
      LIMIT 1
    `;

    const result = await this.pool.query<ConversationEntity>(query, [
      userId1,
      userId2,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.toDomain(result.rows[0].id);
  }

  async search(criteria: ConversationSearchCriteria): Promise<Conversation[]> {
    const conditions: string[] = ["1 = 1"];
    const params: any[] = [];
    let paramCount = 1;

    if (criteria.participantId) {
      conditions.push(`EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = c.id AND cp.user_id = $${paramCount}
      )`);
      params.push(criteria.participantId);
      paramCount++;
    }

    if (criteria.isGroup !== undefined) {
      conditions.push(`c.is_group = $${paramCount}`);
      params.push(criteria.isGroup);
      paramCount++;
    }

    const query = `
      SELECT c.* FROM conversations c
      WHERE ${conditions.join(" AND ")}
      ORDER BY c.updated_at DESC
    `;

    const result = await this.pool.query<ConversationEntity>(query, params);

    const conversations: Conversation[] = [];
    for (const row of result.rows) {
      const conversation = await this.toDomain(row.id);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }

  async addParticipant(roomId: ChatRoomId, userId: string): Promise<void> {
    const query = `
      INSERT INTO conversation_participants 
      (conversation_id, user_id, joined_at, is_active, role)
      VALUES ($1, $2, CURRENT_TIMESTAMP, TRUE, 'member')
      ON CONFLICT (conversation_id, user_id) DO UPDATE SET
        is_active = TRUE,
        last_seen = NULL
    `;

    await this.pool.query(query, [roomId.value, userId]);

    // Atualizar updated_at da conversa
    await this.pool.query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [roomId.value]
    );
  }

  async removeParticipant(roomId: ChatRoomId, userId: string): Promise<void> {
    const query = `
      DELETE FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `;

    await this.pool.query(query, [roomId.value, userId]);

    // Atualizar updated_at da conversa
    await this.pool.query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [roomId.value]
    );
  }

  async updateParticipantStatus(
    roomId: ChatRoomId,
    userId: string,
    isActive: boolean
  ): Promise<void> {
    const query = `
      UPDATE conversation_participants 
      SET is_active = $1,
          last_seen = CASE WHEN $1 = FALSE THEN CURRENT_TIMESTAMP ELSE last_seen END
      WHERE conversation_id = $2 AND user_id = $3
    `;

    await this.pool.query(query, [isActive, roomId.value, userId]);

    // Atualizar updated_at da conversa
    await this.pool.query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [roomId.value]
    );
  }

  async countByParticipant(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT conversation_id) 
      FROM conversation_participants 
      WHERE user_id = $1
    `;

    const result = await this.pool.query<{ count: string }>(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  async countUnreadConversations(userId: string): Promise<number> {
    // Implementação simplificada
    const conversations = await this.findByParticipant(userId);
    return conversations.filter((conv) => conv.getUnreadCount(userId) > 0)
      .length;
  }

  async addMessage(roomId: ChatRoomId, message: any): Promise<void> {
    // Atualizar last_message_id e updated_at
    const query = `
      UPDATE conversations 
      SET last_message_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.pool.query(query, [message.id.value, roomId.value]);
  }

  async getLastMessage(roomId: ChatRoomId): Promise<any | null> {
    const query = "SELECT last_message_id FROM conversations WHERE id = $1";
    const result = await this.pool.query<{ last_message_id: string }>(query, [
      roomId.value,
    ]);

    if (result.rows.length === 0 || !result.rows[0].last_message_id) {
      return null;
    }

    const MessageId =
      require("../../../../domain/value-objects/MessageId").MessageId;
    return this.messageRepository.findById(
      MessageId.create(result.rows[0].last_message_id)
    );
  }

  async archiveOldConversations(days: number): Promise<number> {
    const query = `
      UPDATE conversations 
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{archived}',
        'true'::jsonb
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'
        AND (metadata->>'keepActive')::boolean IS NOT TRUE
      RETURNING id
    `;

    const result = await this.pool.query(query);
    return result.rowCount ?? 0;
  }

  async exists(roomId: ChatRoomId): Promise<boolean> {
    const query = "SELECT 1 FROM conversations WHERE id = $1 LIMIT 1";
    const result = await this.pool.query(query, [roomId.value]);
    return (result.rowCount ?? 0) > 0;
  }

  async isParticipant(roomId: ChatRoomId, userId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2 
      LIMIT 1
    `;

    const result = await this.pool.query(query, [roomId.value, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async findPaginatedByParticipant(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * pageSize;

    const [countResult, convsResult] = await Promise.all([
      this.pool.query<{ count: string }>(
        `SELECT COUNT(DISTINCT c.id) 
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversation_id
         WHERE cp.user_id = $1`,
        [userId]
      ),
      this.pool.query<ConversationEntity>(
        `SELECT c.* 
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversation_id
         WHERE cp.user_id = $1
         ORDER BY c.updated_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, pageSize, offset]
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const conversations: Conversation[] = [];

    for (const row of convsResult.rows) {
      const conversation = await this.toDomain(row.id);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    const totalPages = Math.ceil(total / pageSize);

    return {
      conversations,
      total,
      page,
      totalPages,
    };
  }

  async updateLastSeen(userId: string, roomIds: ChatRoomId[]): Promise<void> {
    if (roomIds.length === 0) return;

    const ids = roomIds.map((id) => id.value);
    const query = `
      UPDATE conversation_participants 
      SET last_seen = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND conversation_id = ANY($2)
    `;

    await this.pool.query(query, [userId, ids]);
  }

  async markAllAsRead(userId: string, roomId: ChatRoomId): Promise<void> {
    // Buscar mensagens não lidas na conversa
    const query = `
      SELECT m.id 
      FROM messages m
      WHERE m.room_id = $1 
        AND m.receiver_id = $2
        AND m.status IN ('sent', 'delivered')
    `;

    const result = await this.pool.query<{ id: string }>(query, [
      roomId.value,
      userId,
    ]);

    if (result.rows.length > 0) {
      const MessageId =
        require("../../../../domain/value-objects/MessageId").MessageId;
      const messageIds = result.rows.map((row) => MessageId.create(row.id));
      await this.messageRepository.markManyAsRead(messageIds);
    }
  }

  async createDirect(userId1: string, userId2: string): Promise<Conversation> {
    const ChatRoomId =
      require("../../../../domain/value-objects/ChatRoomId").ChatRoomId;
    const roomId = ChatRoomId.createDirect(userId1, userId2);

    const existing = await this.findById(roomId);
    if (existing) {
      return existing;
    }

    // Criar nova conversa direta
    const conversation =
      require("../../../../domain/aggregates/Conversation").Conversation.createDirect(
        userId1,
        userId2
      );
    await this.save(conversation);

    return conversation;
  }

  async createGroup(
    groupId: string,
    participants: string[],
    metadata: Record<string, any> = {}
  ): Promise<Conversation> {
    const ChatRoomId =
      require("../../../../domain/value-objects/ChatRoomId").ChatRoomId;
    const roomId = ChatRoomId.createGroup(groupId);

    const conversation =
      require("../../../../domain/aggregates/Conversation").Conversation.createGroup(
        groupId,
        participants,
        metadata
      );

    await this.save(conversation);
    return conversation;
  }

  // ========== MÉTODOS ESTENDIDOS ==========

  async getConversationStats(roomId: ChatRoomId): Promise<{
    participantCount: number;
    activeParticipants: number;
    messageCount: number;
    lastActivity: Date | null;
    unreadCount: number;
    avgResponseTime: number | null;
  }> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = $1) as participant_count,
        (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = $1 AND is_active = TRUE) as active_participants,
        (SELECT COUNT(*) FROM messages WHERE room_id = $1) as message_count,
        (SELECT MAX(updated_at) FROM conversations WHERE id = $1) as last_activity,
        (SELECT COUNT(*) FROM messages WHERE room_id = $1 AND status IN ('sent', 'delivered')) as unread_count,
        (SELECT AVG(read_time_ms) FROM message_metrics mm 
         JOIN messages m ON mm.message_id = m.id 
         WHERE m.room_id = $1 AND mm.read_time_ms IS NOT NULL) as avg_response_time
    `;

    const result = await this.pool.query<{
      participant_count: string;
      active_participants: string;
      message_count: string;
      last_activity: Date | null;
      unread_count: string;
      avg_response_time: string | null;
    }>(query, [roomId.value]);

    const row = result.rows[0];
    return {
      participantCount: parseInt(row.participant_count, 10),
      activeParticipants: parseInt(row.active_participants, 10),
      messageCount: parseInt(row.message_count, 10),
      lastActivity: row.last_activity,
      unreadCount: parseInt(row.unread_count, 10),
      avgResponseTime: row.avg_response_time
        ? parseFloat(row.avg_response_time)
        : null,
    };
  }

  async searchConversationsByName(
    name: string,
    userId?: string
  ): Promise<Conversation[]> {
    let query = `
      SELECT DISTINCT c.* 
      FROM conversations c
      WHERE c.is_group = TRUE
        AND (c.metadata->>'name') ILIKE $1
    `;

    const params: any[] = [`%${name}%`];

    if (userId) {
      query += ` AND EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = c.id AND cp.user_id = $2
      )`;
      params.push(userId);
    }

    query += " ORDER BY c.updated_at DESC LIMIT 20";

    const result = await this.pool.query<ConversationEntity>(query, params);

    const conversations: Conversation[] = [];
    for (const row of result.rows) {
      const conversation = await this.toDomain(row.id);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }

  async getConversationsWithUnreadCount(userId: string): Promise<
    Array<{
      conversation: Conversation;
      unreadCount: number;
      lastMessage: any | null;
    }>
  > {
    const query = `
      SELECT 
        c.*,
        COALESCE(umc.unread_count, 0) as unread_count,
        lm.id as last_message_id,
        lm.content as last_message_content,
        lm.sent_at as last_message_sent_at,
        lm.sender_id as last_message_sender_id
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN (
        SELECT 
          room_id,
          COUNT(*) as unread_count
        FROM messages
        WHERE receiver_id = $1
          AND status IN ('sent', 'delivered')
          AND (deleted_for IS NULL OR NOT $1 = ANY(deleted_for))
        GROUP BY room_id
      ) umc ON c.id = umc.room_id
      LEFT JOIN LATERAL (
        SELECT id, content, sent_at, sender_id
        FROM messages m
        WHERE m.room_id = c.id
          AND (m.deleted_for IS NULL OR NOT $1 = ANY(m.deleted_for))
        ORDER BY sent_at DESC
        LIMIT 1
      ) lm ON TRUE
      WHERE cp.user_id = $1
      ORDER BY COALESCE(lm.sent_at, c.updated_at) DESC
    `;

    const result = await this.pool.query(query, [userId]);

    const conversations: Array<{
      conversation: Conversation;
      unreadCount: number;
      lastMessage: any | null;
    }> = [];

    for (const row of result.rows) {
      const conversation = await this.toDomain(row.id);
      if (conversation) {
        conversations.push({
          conversation,
          unreadCount: parseInt(row.unread_count, 10),
          lastMessage: row.last_message_id
            ? {
                id: row.last_message_id,
                content: row.last_message_content,
                sentAt: row.last_message_sent_at,
                senderId: row.last_message_sender_id,
              }
            : null,
        });
      }
    }

    return conversations;
  }

  async updateConversationMetadata(
    roomId: ChatRoomId,
    metadata: Record<string, any>
  ): Promise<void> {
    const query = `
      UPDATE conversations 
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        $2,
        $3::jsonb
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    // Atualizar cada chave separadamente
    for (const [key, value] of Object.entries(metadata)) {
      await this.pool.query(query, [
        roomId.value,
        `{${key}}`,
        JSON.stringify(value),
      ]);
    }
  }

  async addParticipants(roomId: ChatRoomId, userIds: string[]): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      for (const userId of userIds) {
        const query = `
          INSERT INTO conversation_participants 
          (conversation_id, user_id, joined_at, is_active, role)
          VALUES ($1, $2, CURRENT_TIMESTAMP, TRUE, 'member')
          ON CONFLICT (conversation_id, user_id) DO UPDATE SET
            is_active = TRUE,
            last_seen = NULL
        `;

        await client.query(query, [roomId.value, userId]);
      }

      // Atualizar updated_at da conversa
      await client.query(
        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [roomId.value]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async removeParticipants(
    roomId: ChatRoomId,
    userIds: string[]
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      for (const userId of userIds) {
        const query = `
          DELETE FROM conversation_participants 
          WHERE conversation_id = $1 AND user_id = $2
        `;

        await client.query(query, [roomId.value, userId]);
      }

      // Atualizar updated_at da conversa
      await client.query(
        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [roomId.value]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getActiveConversations(hours: number = 24): Promise<Conversation[]> {
    const query = `
      SELECT DISTINCT c.*
      FROM conversations c
      WHERE EXISTS (
        SELECT 1 FROM messages m
        WHERE m.room_id = c.id
          AND m.sent_at > CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
      )
      ORDER BY c.updated_at DESC
      LIMIT 100
    `;

    const result = await this.pool.query<ConversationEntity>(query);

    const conversations: Conversation[] = [];
    for (const row of result.rows) {
      const conversation = await this.toDomain(row.id);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }

  async getConversationParticipants(
    roomId: ChatRoomId
  ): Promise<Participant[]> {
    const query = `
      SELECT * FROM conversation_participants 
      WHERE conversation_id = $1
      ORDER BY joined_at
    `;

    const result = await this.pool.query<ParticipantEntity>(query, [
      roomId.value,
    ]);
    return ChatEntityMapper.toParticipantsDomain(result.rows);
  }

  async cleanupInactiveConversations(days: number): Promise<number> {
    const query = `
      DELETE FROM conversations 
      WHERE id IN (
        SELECT c.id 
        FROM conversations c
        WHERE c.updated_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'
          AND (c.metadata->>'keepActive')::boolean IS NOT TRUE
          AND NOT EXISTS (
            SELECT 1 FROM messages m
            WHERE m.room_id = c.id
              AND m.sent_at > CURRENT_TIMESTAMP - INTERVAL '${days} days'
          )
      )
      RETURNING id
    `;

    const result = await this.pool.query(query);
    return result.rowCount ?? 0;
  }

  async getConversationActivityReport(
    startDate: Date,
    endDate: Date
  ): Promise<
    Array<{
      roomId: string;
      isGroup: boolean;
      participantCount: number;
      messageCount: number;
      activeParticipants: number;
      lastActivity: Date | null;
    }>
  > {
    const query = `
      SELECT 
        c.id as room_id,
        c.is_group,
        COUNT(DISTINCT cp.user_id) as participant_count,
        COUNT(DISTINCT m.id) as message_count,
        COUNT(DISTINCT m.sender_id) as active_participants,
        MAX(m.sent_at) as last_activity
      FROM conversations c
      LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN messages m ON c.id = m.room_id 
        AND m.sent_at BETWEEN $1 AND $2
      GROUP BY c.id, c.is_group
      HAVING COUNT(DISTINCT m.id) > 0
      ORDER BY COUNT(DISTINCT m.id) DESC
      LIMIT 100
    `;

    const result = await this.pool.query(query, [
      startDate.toISOString(),
      endDate.toISOString(),
    ]);

    return result.rows.map((row) => ({
      roomId: row.room_id,
      isGroup: row.is_group,
      participantCount: parseInt(row.participant_count, 10),
      messageCount: parseInt(row.message_count, 10),
      activeParticipants: parseInt(row.active_participants, 10),
      lastActivity: row.last_activity,
    }));
  }
}
