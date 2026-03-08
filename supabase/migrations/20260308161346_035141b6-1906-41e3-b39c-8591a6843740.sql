
-- Sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'live_video',
  invite_code TEXT NOT NULL UNIQUE,
  meeting_link TEXT,
  recording_link TEXT,
  notes_content TEXT,
  materials_url TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session participants table
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_marked BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(session_id, user_id)
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Sessions RLS policies
CREATE POLICY "Faculty/admin can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (is_faculty() OR is_admin());

CREATE POLICY "Faculty/admin can update own sessions"
  ON public.sessions FOR UPDATE
  USING ((auth.uid() = created_by) OR is_admin());

CREATE POLICY "Faculty/admin can delete own sessions"
  ON public.sessions FOR DELETE
  USING ((auth.uid() = created_by) OR is_admin());

CREATE POLICY "Authenticated users can view sessions they participate in or created"
  ON public.sessions FOR SELECT
  USING (
    (auth.uid() = created_by) 
    OR is_admin() 
    OR is_faculty()
    OR EXISTS (
      SELECT 1 FROM public.session_participants sp 
      WHERE sp.session_id = sessions.id AND sp.user_id = auth.uid()
    )
  );

-- Session participants RLS policies
CREATE POLICY "Students can join sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own participation"
  ON public.session_participants FOR SELECT
  USING (
    (auth.uid() = user_id) 
    OR is_admin() 
    OR is_faculty()
  );

CREATE POLICY "Faculty/admin can remove participants"
  ON public.session_participants FOR DELETE
  USING (is_faculty() OR is_admin());

-- Enable realtime for sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
