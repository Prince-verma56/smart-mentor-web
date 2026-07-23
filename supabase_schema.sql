-- ============================================================
-- SuperMentor Phase 3 Complete Schema
-- ============================================================

-- MENTORS TABLE
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    subject TEXT NOT NULL,
    specialization TEXT,
    difficulty_level TEXT,
    learning_style TEXT,
    conversation_style TEXT,
    teaching_speed TEXT,
    response_length TEXT,
    preferred_language TEXT,
    learning_goal TEXT,
    session_duration INTEGER,
    knowledge_focus TEXT,
    additional_instructions TEXT,
    goal_deadline TEXT,
    avatar_url TEXT,
    avatar_color TEXT,
    voice_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.mentors;
CREATE POLICY "Allow all operations for development" ON public.mentors
    FOR ALL USING (true) WITH CHECK (true);

-- ROADMAPS TABLE
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_estimated_hours INTEGER DEFAULT 0,
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.roadmaps;
CREATE POLICY "Allow all operations for development" ON public.roadmaps
    FOR ALL USING (true) WITH CHECK (true);

-- ROADMAP TOPICS TABLE (Full Learning State Engine model)
CREATE TABLE IF NOT EXISTS public.roadmap_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'beginner',
    estimated_minutes INTEGER DEFAULT 30,
    order_index INTEGER NOT NULL,
    status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'in-progress', 'completed', 'skipped', 'revision-required', 'available')),
    prerequisites TEXT[] DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    revision_required BOOLEAN DEFAULT false,
    quiz_score INTEGER,
    confidence_score INTEGER,
    is_skipped BOOLEAN DEFAULT false,
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for development" ON public.roadmap_topics;
CREATE POLICY "Allow all operations for development" ON public.roadmap_topics
    FOR ALL USING (true) WITH CHECK (true);

-- CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.chat_sessions;
CREATE POLICY "Allow all for development" ON public.chat_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.messages;
CREATE POLICY "Allow all for development" ON public.messages
    FOR ALL USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap_id ON public.roadmap_topics(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_status ON public.roadmap_topics(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_mentor_id ON public.chat_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_mentor_id ON public.roadmaps(mentor_id);

-- AUTO-RECALCULATE ROADMAP PROGRESS TRIGGER
CREATE OR REPLACE FUNCTION recalculate_roadmap_progress(p_roadmap_id UUID)
RETURNS void AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.roadmap_topics WHERE roadmap_id = p_roadmap_id;
  SELECT COUNT(*) INTO completed_count FROM public.roadmap_topics 
    WHERE roadmap_id = p_roadmap_id AND status = 'completed';
  IF total_count > 0 THEN
    UPDATE public.roadmaps 
    SET progress_percent = ROUND((completed_count::DECIMAL / total_count) * 100),
        updated_at = NOW()
    WHERE id = p_roadmap_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_recalculate_progress()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_roadmap_progress(NEW.roadmap_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalculate_on_topic_change ON public.roadmap_topics;
CREATE TRIGGER recalculate_on_topic_change
  AFTER INSERT OR UPDATE OF status ON public.roadmap_topics
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_progress();
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_provider TEXT DEFAULT 'vapi';
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_model TEXT DEFAULT 'gpt-4-turbo-preview';
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_language TEXT DEFAULT 'English';
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_greeting TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_speed NUMERIC DEFAULT 1.0;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_temperature NUMERIC DEFAULT 0.7;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_interruptions BOOLEAN DEFAULT true;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS voice_auto_start BOOLEAN DEFAULT false;

-- ============================================================
-- Phase 3.7 Migration: Realtime Sync & Conversation Manager
-- Run this block in Supabase SQL Editor
-- ============================================================

-- Add new columns to chat_sessions for production conversation management
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Index for sidebar sort performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON public.chat_sessions(mentor_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pinned ON public.chat_sessions(mentor_id, is_pinned DESC);

-- Auto-update session stats whenever a message is inserted
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET
    last_message_at = NOW(),
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_insert ON public.messages;
CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_session_on_message();

-- Enable Supabase Realtime on required tables
-- These commands add the tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.roadmap_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.roadmaps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;

-- ============================================================
-- Phase 3.11 Migration: Voice Sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.voice_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.voice_sessions;
CREATE POLICY "Allow all for development" ON public.voice_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_mentor_id ON public.voice_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session_id ON public.voice_sessions(session_id);
