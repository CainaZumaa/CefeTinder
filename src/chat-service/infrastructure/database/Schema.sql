-- ============================================
-- SISTEMA DE CHAT - SCHEMA INICIAL
-- PostgreSQL 13+
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: messages (Mensagens)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    -- Identificação
    id VARCHAR(100) PRIMARY KEY,
    
    -- Conteúdo
    content TEXT NOT NULL,
    
    -- Relacionamentos
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    room_id VARCHAR(200) NOT NULL,
    reply_to VARCHAR(100),
    
    -- Status e timestamps
    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    deleted_for TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_reply_to FOREIGN KEY (reply_to) 
        REFERENCES messages(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: conversations (Conversas)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    -- Identificação
    id VARCHAR(200) PRIMARY KEY,
    
    -- Tipo de conversa
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Referência à última mensagem
    last_message_id VARCHAR(100),
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_last_message FOREIGN KEY (last_message_id) 
        REFERENCES messages(id) ON DELETE SET NULL
);

-- ============================================
-- TABELA: conversation_participants (Participantes)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    -- Chaves estrangeiras
    conversation_id VARCHAR(200) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    
    -- Informações do participante
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'member',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) 
        REFERENCES conversations(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: websocket_sessions (Sessões WebSocket)
-- ============================================
CREATE TABLE IF NOT EXISTS websocket_sessions (
    -- Identificação
    id SERIAL PRIMARY KEY,
    connection_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Usuário
    user_id VARCHAR(100) NOT NULL,
    
    -- Status da conexão
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Salas/rooms
    rooms TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: chat_statistics (Estatísticas)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_statistics (
    -- Identificação
    id SERIAL PRIMARY KEY,
    
    -- Período
    date DATE NOT NULL UNIQUE,
    
    -- Métricas
    total_messages INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    active_conversations INTEGER DEFAULT 0,
    
    -- Detalhes por hora
    messages_per_hour JSONB DEFAULT '[]'::jsonb,
    
    -- Top conversas
    most_active_conversations JSONB DEFAULT '[]'::jsonb,
    
    -- Top usuários
    most_active_users JSONB DEFAULT '[]'::jsonb,
    
    -- Tempos médios
    avg_delivery_time_ms INTEGER DEFAULT 0,
    avg_read_time_ms INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: message_metrics (Métricas de Mensagens)
-- ============================================
CREATE TABLE IF NOT EXISTS message_metrics (
    -- Identificação
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL,
    
    -- Tempos
    delivery_time_ms INTEGER,
    read_time_ms INTEGER,
    
    -- Status do delivery
    delivery_attempts INTEGER DEFAULT 1,
    delivery_status VARCHAR(20) DEFAULT 'pending',
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_message FOREIGN KEY (message_id) 
        REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT unique_message_metric UNIQUE (message_id)
);

-- ============================================
-- TABELA: user_chat_preferences (Preferências)
-- ============================================
CREATE TABLE IF NOT EXISTS user_chat_preferences (
    -- Identificação
    user_id VARCHAR(100) PRIMARY KEY,
    
    -- Notificações
    enable_push_notifications BOOLEAN DEFAULT TRUE,
    enable_email_notifications BOOLEAN DEFAULT FALSE,
    enable_sound BOOLEAN DEFAULT TRUE,
    notification_sound VARCHAR(100) DEFAULT 'default',
    
    -- Privacidade
    show_online_status BOOLEAN DEFAULT TRUE,
    show_last_seen BOOLEAN DEFAULT TRUE,
    allow_message_from VARCHAR(20) DEFAULT 'everyone' 
        CHECK (allow_message_from IN ('everyone', 'contacts', 'nobody')),
    
    -- Tema e aparência
    theme VARCHAR(20) DEFAULT 'light',
    font_size VARCHAR(20) DEFAULT 'medium',
    
    -- Outras configurações
    auto_download_media BOOLEAN DEFAULT TRUE,
    media_quality VARCHAR(20) DEFAULT 'medium',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: chat_blocks (Bloqueios)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_blocks (
    -- Identificação
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento
    blocker_id VARCHAR(100) NOT NULL,
    blocked_id VARCHAR(100) NOT NULL,
    
    -- Informações do bloqueio
    reason VARCHAR(200),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
    CONSTRAINT check_self_block CHECK (blocker_id != blocked_id)
);

-- ============================================
-- TABELA: archived_messages (Mensagens Arquivadas)
-- ============================================
CREATE TABLE IF NOT EXISTS archived_messages (
    -- Identificação (mesmo ID da mensagem original)
    id VARCHAR(100) PRIMARY KEY,
    
    -- Dados da mensagem (cópia dos campos originais)
    original_message_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    room_id VARCHAR(200) NOT NULL,
    
    -- Metadados de arquivamento
    archived_by VARCHAR(100) NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archive_reason VARCHAR(200),
    
    -- Metadados originais preservados
    original_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: chat_reports (Denúncias)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_reports (
    -- Identificação
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(100) UNIQUE NOT NULL DEFAULT ('report_' || uuid_generate_v4()),
    
    -- Relacionamento
    reporter_id VARCHAR(100) NOT NULL,
    reported_id VARCHAR(100) NOT NULL,
    message_id VARCHAR(100),
    
    -- Informações da denúncia
    report_type VARCHAR(50) NOT NULL 
        CHECK (report_type IN ('spam', 'harassment', 'inappropriate', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
    priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Ações tomadas
    action_taken VARCHAR(200),
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_room_sent ON messages(room_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_for ON messages USING GIN (deleted_for);
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_messages_full_text ON messages USING GIN(to_tsvector('english', content));

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_is_group ON conversations(is_group);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_metadata ON conversations USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_id) 
    WHERE last_message_id IS NOT NULL;

-- Índices para conversation_participants
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_is_active ON conversation_participants(is_active);
CREATE INDEX IF NOT EXISTS idx_participants_last_seen ON conversation_participants(last_seen DESC);

-- Índices para websocket_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON websocket_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON websocket_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_connected_at ON websocket_sessions(connected_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_rooms ON websocket_sessions USING GIN (rooms);

-- Índices para message_metrics
CREATE INDEX IF NOT EXISTS idx_metrics_message_id ON message_metrics(message_id);
CREATE INDEX IF NOT EXISTS idx_metrics_delivery_time ON message_metrics(delivery_time_ms);
CREATE INDEX IF NOT EXISTS idx_metrics_read_time ON message_metrics(read_time_ms);

-- Índices para chat_blocks
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON chat_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON chat_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocks_expires_at ON chat_blocks(expires_at) 
    WHERE expires_at IS NOT NULL;

-- Índices para chat_reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON chat_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON chat_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON chat_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON chat_reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON chat_reports(created_at DESC);

-- ============================================
-- VIEWS PARA CONSULTAS COMUNS
-- ============================================

-- View: active_messages (mensagens não deletadas)
CREATE OR REPLACE VIEW active_messages AS
SELECT * FROM messages 
WHERE array_length(deleted_for, 1) IS NULL OR array_length(deleted_for, 1) = 0;

-- View: conversations_with_stats (conversas com estatísticas)
CREATE OR REPLACE VIEW conversations_with_stats AS
SELECT 
    c.*,
    COUNT(cp.user_id) as participant_count,
    COUNT(CASE WHEN cp.is_active THEN 1 END) as active_participants,
    MAX(m.sent_at) as last_message_at
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN messages m ON c.id = m.room_id
GROUP BY c.id;

-- View: user_conversations (conversas por usuário)
CREATE OR REPLACE VIEW user_conversations AS
SELECT 
    cp.user_id,
    c.*,
    cp.joined_at as user_joined_at,
    cp.role as user_role
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id;

-- View: unread_messages_count (contador de não lidas)
CREATE OR REPLACE VIEW unread_messages_count AS
SELECT 
    m.receiver_id as user_id,
    m.room_id,
    COUNT(*) as unread_count
FROM messages m
WHERE m.status IN ('sent', 'delivered')
    AND (m.deleted_for IS NULL OR NOT m.receiver_id = ANY(m.deleted_for))
GROUP BY m.receiver_id, m.room_id;

-- View: online_users (usuários online)
CREATE OR REPLACE VIEW online_users AS
SELECT DISTINCT
    ws.user_id,
    MAX(ws.last_activity) as last_activity,
    COUNT(ws.id) as active_connections
FROM websocket_sessions ws
WHERE ws.disconnected_at IS NULL
    AND ws.last_activity > (CURRENT_TIMESTAMP - INTERVAL '5 minutes')
GROUP BY ws.user_id;

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_participants_updated_at
    BEFORE UPDATE ON conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websocket_sessions_updated_at
    BEFORE UPDATE ON websocket_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar last_message_id automaticamente
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_id = NEW.id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar last_message_id
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Função para calcular métricas de delivery
CREATE OR REPLACE FUNCTION calculate_message_metrics()
RETURNS TRIGGER AS $$
DECLARE
    delivery_time INTEGER;
    read_time INTEGER;
BEGIN
    -- Calcular tempo de entrega
    IF NEW.delivered_at IS NOT NULL AND NEW.sent_at IS NOT NULL THEN
        delivery_time := EXTRACT(EPOCH FROM (NEW.delivered_at - NEW.sent_at)) * 1000;
    END IF;
    
    -- Calcular tempo de leitura
    IF NEW.read_at IS NOT NULL AND NEW.sent_at IS NOT NULL THEN
        read_time := EXTRACT(EPOCH FROM (NEW.read_at - NEW.sent_at)) * 1000;
    END IF;
    
    -- Inserir ou atualizar métricas
    INSERT INTO message_metrics (message_id, delivery_time_ms, read_time_ms)
    VALUES (NEW.id, delivery_time, read_time)
    ON CONFLICT (message_id) DO UPDATE SET
        delivery_time_ms = EXCLUDED.delivery_time_ms,
        read_time_ms = EXCLUDED.read_time_ms,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para métricas
CREATE TRIGGER calculate_metrics_on_status_change
    AFTER UPDATE OF delivered_at, read_at ON messages
    FOR EACH ROW
    WHEN (OLD.delivered_at IS DISTINCT FROM NEW.delivered_at OR 
          OLD.read_at IS DISTINCT FROM NEW.read_at)
    EXECUTE FUNCTION calculate_message_metrics();

-- Função para limpar sessões inativas
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
    UPDATE websocket_sessions 
    SET disconnected_at = CURRENT_TIMESTAMP
    WHERE disconnected_at IS NULL
        AND last_activity < (CURRENT_TIMESTAMP - INTERVAL '1 hour');
END;
$$ language 'plpgsql';

-- Função para arquivar mensagens antigas
CREATE OR REPLACE FUNCTION archive_old_messages(retention_days INTEGER)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    INSERT INTO archived_messages (
        id, original_message_id, content, sender_id, receiver_id, room_id,
        archived_by, archive_reason, original_metadata
    )
    SELECT 
        'archived_' || m.id,
        m.id,
        m.content,
        m.sender_id,
        m.receiver_id,
        m.room_id,
        'system',
        'automatic_archive',
        m.metadata
    FROM messages m
    WHERE m.sent_at < (CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL)
        AND (m.metadata->>'keepForever')::boolean IS NOT TRUE
        AND NOT EXISTS (
            SELECT 1 FROM archived_messages am 
            WHERE am.original_message_id = m.id
        );
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Opcional: deletar mensagens arquivadas
    -- DELETE FROM messages 
    -- WHERE sent_at < (CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL);
    
    RETURN archived_count;
END;
$$ language 'plpgsql';

-- ============================================
-- PROCEDURES
-- ============================================

-- Procedure: marcar múltiplas mensagens como lidas
CREATE OR REPLACE PROCEDURE mark_messages_as_read(
    p_user_id VARCHAR,
    p_room_id VARCHAR,
    p_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE messages 
    SET status = 'read',
        read_at = p_read_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE room_id = p_room_id
        AND receiver_id = p_user_id
        AND status IN ('sent', 'delivered');
    
    COMMIT;
END;
$$;

-- Procedure: criar conversa direta
CREATE OR REPLACE PROCEDURE create_direct_conversation(
    p_user_id_1 VARCHAR,
    p_user_id_2 VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_room_id VARCHAR;
    v_sorted_ids VARCHAR[];
BEGIN
    -- Ordenar IDs para garantir unicidade
    v_sorted_ids := ARRAY[
        LEAST(p_user_id_1, p_user_id_2),
        GREATEST(p_user_id_1, p_user_id_2)
    ];
    
    v_room_id := 'direct_' || v_sorted_ids[1] || '_' || v_sorted_ids[2];
    
    -- Inserir conversa se não existir
    INSERT INTO conversations (id, is_group, metadata)
    VALUES (v_room_id, FALSE, jsonb_build_object(
        'type', 'direct',
        'created_by', 'system'
    ))
    ON CONFLICT (id) DO NOTHING;
    
    -- Inserir participantes
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_room_id, v_sorted_ids[1])
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_room_id, v_sorted_ids[2])
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    
    COMMIT;
END;
$$;

-- Procedure: atualizar estatísticas diárias
CREATE OR REPLACE PROCEDURE update_daily_statistics()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO chat_statistics (
        date,
        total_messages,
        active_users,
        active_conversations,
        messages_per_hour,
        most_active_conversations,
        most_active_users,
        avg_delivery_time_ms,
        avg_read_time_ms
    )
    SELECT
        CURRENT_DATE,
        -- Total de mensagens do dia
        COUNT(DISTINCT m.id),
        -- Usuários ativos
        COUNT(DISTINCT ws.user_id),
        -- Conversas ativas
        COUNT(DISTINCT m.room_id),
        -- Mensagens por hora
        (
            SELECT jsonb_agg(jsonb_build_object(
                'hour', hour,
                'count', message_count
            ))
            FROM (
                SELECT 
                    EXTRACT(HOUR FROM sent_at) as hour,
                    COUNT(*) as message_count
                FROM messages
                WHERE sent_at::DATE = CURRENT_DATE
                GROUP BY EXTRACT(HOUR FROM sent_at)
                ORDER BY hour
            ) hourly
        ),
        -- Conversas mais ativas
        (
            SELECT jsonb_agg(jsonb_build_object(
                'room_id', room_id,
                'message_count', message_count
            ))
            FROM (
                SELECT 
                    room_id,
                    COUNT(*) as message_count
                FROM messages
                WHERE sent_at::DATE = CURRENT_DATE
                GROUP BY room_id
                ORDER BY message_count DESC
                LIMIT 10
            ) top_rooms
        ),
        -- Usuários mais ativos
        (
            SELECT jsonb_agg(jsonb_build_object(
                'user_id', user_id,
                'message_count', message_count
            ))
            FROM (
                SELECT 
                    sender_id as user_id,
                    COUNT(*) as message_count
                FROM messages
                WHERE sent_at::DATE = CURRENT_DATE
                GROUP BY sender_id
                ORDER BY message_count DESC
                LIMIT 10
            ) top_users
        ),
        -- Tempo médio de entrega
        COALESCE((
            SELECT AVG(delivery_time_ms)
            FROM message_metrics mm
            JOIN messages m ON mm.message_id = m.id
            WHERE m.sent_at::DATE = CURRENT_DATE
                AND mm.delivery_time_ms IS NOT NULL
        ), 0),
        -- Tempo médio de leitura
        COALESCE((
            SELECT AVG(read_time_ms)
            FROM message_metrics mm
            JOIN messages m ON mm.message_id = m.id
            WHERE m.sent_at::DATE = CURRENT_DATE
                AND mm.read_time_ms IS NOT NULL
        ), 0)
    FROM messages m
    LEFT JOIN websocket_sessions ws ON ws.disconnected_at IS NULL
        AND ws.last_activity > (CURRENT_TIMESTAMP - INTERVAL '1 day')
    WHERE m.sent_at::DATE = CURRENT_DATE
    ON CONFLICT (date) DO UPDATE SET
        total_messages = EXCLUDED.total_messages,
        active_users = EXCLUDED.active_users,
        active_conversations = EXCLUDED.active_conversations,
        messages_per_hour = EXCLUDED.messages_per_hour,
        most_active_conversations = EXCLUDED.most_active_conversations,
        most_active_users = EXCLUDED.most_active_users,
        avg_delivery_time_ms = EXCLUDED.avg_delivery_time_ms,
        avg_read_time_ms = EXCLUDED.avg_read_time_ms,
        updated_at = CURRENT_TIMESTAMP;
    
    COMMIT;
END;
$$;

-- ============================================
-- INSERT DE DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir usuário do sistema
INSERT INTO user_chat_preferences (user_id, enable_push_notifications, allow_message_from)
VALUES ('system', FALSE, 'nobody')
ON CONFLICT (user_id) DO NOTHING;

-- Inserir conversa do sistema
INSERT INTO conversations (id, is_group, metadata)
VALUES ('system_chat', TRUE, jsonb_build_object(
    'name', 'System Notifications',
    'description', 'System messages and notifications',
    'type', 'system',
    'created_by', 'system'
))
ON CONFLICT (id) DO NOTHING;

-- Inserir participantes da conversa do sistema
INSERT INTO conversation_participants (conversation_id, user_id, role)
VALUES ('system_chat', 'system', 'admin')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- ============================================
-- COMENTÁRIOS DAS TABELAS
-- ============================================
COMMENT ON TABLE messages IS 'Armazena todas as mensagens do sistema de chat';
COMMENT ON TABLE conversations IS 'Armazena conversas (diretas ou em grupo)';
COMMENT ON TABLE conversation_participants IS 'Relação entre usuários e conversas';
COMMENT ON TABLE websocket_sessions IS 'Sessões ativas de WebSocket';
COMMENT ON TABLE chat_statistics IS 'Estatísticas diárias do sistema de chat';
COMMENT ON TABLE message_metrics IS 'Métricas de performance das mensagens';
COMMENT ON TABLE user_chat_preferences IS 'Preferências de usuário para chat';
COMMENT ON TABLE chat_blocks IS 'Relações de bloqueio entre usuários';
COMMENT ON TABLE archived_messages IS 'Mensagens arquivadas para histórico';
COMMENT ON TABLE chat_reports IS 'Denúncias de mensagens ou usuários';

COMMENT ON COLUMN messages.deleted_for IS 'Array de user_ids que deletaram esta mensagem';
COMMENT ON COLUMN messages.metadata IS 'Metadados customizados da mensagem';
COMMENT ON COLUMN conversations.metadata IS 'Metadados da conversa (nome, descrição, etc)';
COMMENT ON COLUMN websocket_sessions.rooms IS 'Salas/rooms que a conexão está ouvindo';

-- ============================================
-- PRIVILEGIOS (AJUSTAR CONFORME NECESSÁRIO)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO chat_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO chat_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO chat_user;