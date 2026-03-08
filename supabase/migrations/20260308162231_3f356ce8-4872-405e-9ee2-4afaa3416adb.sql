
-- 1. Create colleges table
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- 2. Add college_id to profiles FIRST (before functions reference it)
ALTER TABLE public.profiles ADD COLUMN college_id UUID REFERENCES public.colleges(id);

-- 3. Add college_id to content tables
ALTER TABLE public.sessions ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.degrees ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.books ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.quizzes ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.assignments ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.news ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.notifications ADD COLUMN college_id UUID REFERENCES public.colleges(id);

-- 4. Now create functions (profiles.college_id exists)
CREATE OR REPLACE FUNCTION public.is_college_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'college_admin')
$$;

CREATE OR REPLACE FUNCTION public.get_user_college_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT college_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.same_college(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.college_id = p2.college_id
    WHERE p1.user_id = auth.uid() AND p2.user_id = _user_id
    AND p1.college_id IS NOT NULL
  )
$$;

-- 5. RLS policies for colleges
CREATE POLICY "Anyone can view active colleges" ON public.colleges
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Platform admin manages colleges" ON public.colleges
  FOR ALL USING (is_admin());
