-- Match Service DB schema (Database-per-Service)
-- Intentionally does NOT reference user-service tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL,
    user2_id UUID NOT NULL,
    user1_liked BOOLEAN NOT NULL DEFAULT false,
    user2_liked BOOLEAN NOT NULL DEFAULT false,
    is_super_like BOOLEAN NOT NULL DEFAULT false,
    matched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_match UNIQUE(user1_id, user2_id),
    CONSTRAINT check_different_users CHECK (user1_id != user2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON public.matches(matched_at) WHERE matched_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at'
  ) THEN
    CREATE TRIGGER update_matches_updated_at
      BEFORE UPDATE ON public.matches
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
