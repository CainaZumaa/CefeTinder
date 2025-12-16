-- Create tables if they don't exist (safer approach)
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(255) PRIMARY KEY,
    participants TEXT[] NOT NULL DEFAULT '{}',
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    chat_room_id VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_chat_room_id') THEN
        CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_participants') THEN
        CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);
    END IF;
END $$;

-- Insert sample data (only if tables are empty)
INSERT INTO conversations (id, participants) 
SELECT 'room_1', ARRAY['user_1', 'user_2']
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE id = 'room_1');

INSERT INTO messages (id, content, sender_id, receiver_id, chat_room_id, sent_at) 
SELECT 'msg_1', 'Hello!', 'user_1', 'user_2', 'room_1', NOW()
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE id = 'msg_1');