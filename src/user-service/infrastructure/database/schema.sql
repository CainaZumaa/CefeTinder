-- =====================================================
-- DDL para UserService - Database per Service
-- Banco: users (ou o nome que você escolher)
-- Schema: public
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Tabela: users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 110),
    gender VARCHAR(50) NOT NULL,
    bio TEXT,
    last_super_like TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- =====================================================
-- Tabela: interests
-- =====================================================
CREATE TABLE IF NOT EXISTS public.interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para interests
CREATE INDEX IF NOT EXISTS idx_interests_name ON public.interests(name);

-- =====================================================
-- Tabela: users_interests (tabela de junção)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users_interests (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    interest_id INTEGER NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interest_id)
);

-- Índices para users_interests
CREATE INDEX IF NOT EXISTS idx_users_interests_user_id ON public.users_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_users_interests_interest_id ON public.users_interests(interest_id);

-- =====================================================
-- Tabela: users_preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    min_age INTEGER NOT NULL DEFAULT 18 CHECK (min_age >= 18),
    max_age INTEGER NOT NULL DEFAULT 100 CHECK (max_age <= 100),
    gender_preference VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_age_range CHECK (min_age <= max_age)
);

-- =====================================================
-- Função para atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers para updated_at
-- =====================================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_preferences_updated_at
    BEFORE UPDATE ON public.users_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Comentários (documentação)
-- =====================================================
COMMENT ON TABLE public.users IS 'Tabela de usuários do UserService';
COMMENT ON TABLE public.interests IS 'Tabela de interesses disponíveis';
COMMENT ON TABLE public.users_interests IS 'Tabela de junção entre usuários e interesses';
COMMENT ON TABLE public.users_preferences IS 'Preferências de busca de cada usuário';

COMMENT ON COLUMN public.users.last_super_like IS 'Timestamp do último super like enviado. Usado para controlar cooldown de 24 horas.';

