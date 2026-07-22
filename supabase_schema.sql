-- Run this in your Supabase SQL Editor to create the necessary tables!

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

-- Enable Row Level Security (RLS) but since we don't have Supabase Auth fully hooked up yet,
-- we'll allow all operations for development. (In production, you'd tie this to auth.uid())
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for development" ON public.mentors
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Roadmap Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.roadmaps
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Roadmap Topics Table
CREATE TABLE IF NOT EXISTS public.roadmap_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in-progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.roadmap_topics
    FOR ALL
    USING (true)
    WITH CHECK (true);
