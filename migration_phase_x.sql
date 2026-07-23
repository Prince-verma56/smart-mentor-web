-- ============================================================
-- Phase X Migration: Intelligent Learning Workspace
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. LEARNING SESSIONS (Detailed session tracking)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    session_type TEXT DEFAULT 'chat' CHECK (session_type IN ('chat', 'voice', 'coding')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    topic TEXT,
    confidence_before INTEGER,
    confidence_after INTEGER,
    quiz_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.learning_sessions;
CREATE POLICY "Allow all for development" ON public.learning_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_mentor_id ON public.learning_sessions(mentor_id);

-- 2. MENTOR MEMORIES (Long-term factual store)
CREATE TABLE IF NOT EXISTS public.mentor_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'preference', 'weakness', 'strength', 'goal')),
    memory_text TEXT NOT NULL,
    importance INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mentor_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.mentor_memories;
CREATE POLICY "Allow all for development" ON public.mentor_memories FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_mentor_memories_mentor_id ON public.mentor_memories(mentor_id);

-- 3. SESSION SUMMARIES (Shared Context)
CREATE TABLE IF NOT EXISTS public.session_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    source_session_id UUID,
    summary_text TEXT NOT NULL,
    topics_covered TEXT[],
    extracted_memories TEXT[],
    roadmap_impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.session_summaries;
CREATE POLICY "Allow all for development" ON public.session_summaries FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_session_summaries_mentor_id ON public.session_summaries(mentor_id);

-- 4. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond', 'legendary')),
    title TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON public.achievements;
CREATE POLICY "Allow all for development" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_achievements_mentor_id ON public.achievements(mentor_id);

-- Add missing columns to chat_sessions (Phase X)
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS color_label TEXT;

-- Enable Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_memories;
