-- ============================================
-- OTIMIZAÇÕES DE PERFORMANCE
-- ============================================

-- 1. Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
    ON messages(sender_id, receiver_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_room_status 
    ON messages(room_id, status, sent_at DESC) 
    WHERE status IN ('sent', 'delivered');

CREATE INDEX IF NOT EXISTS idx_conversations_updated_group 
    ON conversations(updated_at DESC, is_group);

-- 2. Índices parciais para melhor performance
CREATE INDEX IF NOT EXISTS idx_active_participants 
    ON conversation_participants(conversation_id) 
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_recent_messages 
    ON messages(sent_at DESC) 
    WHERE sent_at > (CURRENT_TIMESTAMP - INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_unread_messages 
    ON messages(receiver_id, room_id, sent_at DESC) 
    WHERE status IN ('sent', 'delivered')
        AND (deleted_for IS NULL OR NOT receiver_id = ANY(deleted_for));

-- 3. Índices para queries de busca
CREATE INDEX IF NOT EXISTS idx_messages_content_trigram 
    ON messages USING GIN (content gin_trgm_ops);

-- 4. Otimizar tabelas (clusterizar)
-- CLUSTER messages USING idx_messages_room_sent;
-- CLUSTER conversations USING idx_conversations_updated_at;

-- 5. Criar tabelas particionadas para escalabilidade (opcional)
/*
-- Tabela particionada de mensagens por mês
CREATE TABLE messages_partitioned (
    LIKE messages INCLUDING ALL
) PARTITION BY RANGE (sent_at);

-- Partições para o ano atual e próximo
CREATE TABLE messages_y2024m01 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE messages_y2024m02 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Índices em cada partição
CREATE INDEX idx_messages_partitioned_room_id ON messages_partitioned(room_id);
CREATE INDEX idx_messages_partitioned_sent_at ON messages_partitioned(sent_at DESC);
*/