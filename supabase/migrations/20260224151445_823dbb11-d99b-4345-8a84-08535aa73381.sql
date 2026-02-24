
-- Degrees table
CREATE TABLE public.degrees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  duration_years INT NOT NULL DEFAULT 3,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Years table
CREATE TABLE public.years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_id UUID NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  year_number INT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(degree_id, year_number)
);

-- Semesters table
CREATE TABLE public.semesters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year_id UUID NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
  semester_number INT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(year_id, semester_number)
);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  credits INT NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subject_id, unit_number)
);

-- Topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  topic_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unit_id, topic_number)
);

-- Lectures table
CREATE TABLE public.lectures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'note', 'assignment', 'quiz')),
  video_url TEXT,
  pdf_url TEXT,
  duration_minutes INT,
  sort_order INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

-- READ policies: all authenticated users can view published content
CREATE POLICY "Anyone can view degrees" ON public.degrees FOR SELECT USING (true);
CREATE POLICY "Anyone can view years" ON public.years FOR SELECT USING (true);
CREATE POLICY "Anyone can view semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view lectures" ON public.lectures FOR SELECT USING (true);

-- WRITE policies: only admins and faculty can manage course content
CREATE POLICY "Admins/faculty can insert degrees" ON public.degrees FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins/faculty can update degrees" ON public.degrees FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete degrees" ON public.degrees FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert years" ON public.years FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update years" ON public.years FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete years" ON public.years FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert semesters" ON public.semesters FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update semesters" ON public.semesters FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete semesters" ON public.semesters FOR DELETE USING (is_admin());

CREATE POLICY "Admins/faculty can insert subjects" ON public.subjects FOR INSERT WITH CHECK (is_admin() OR is_faculty());
CREATE POLICY "Admins/faculty can update subjects" ON public.subjects FOR UPDATE USING (is_admin() OR is_faculty());
CREATE POLICY "Admins can delete subjects" ON public.subjects FOR DELETE USING (is_admin());

CREATE POLICY "Admins/faculty can insert units" ON public.units FOR INSERT WITH CHECK (is_admin() OR is_faculty());
CREATE POLICY "Admins/faculty can update units" ON public.units FOR UPDATE USING (is_admin() OR is_faculty());
CREATE POLICY "Admins can delete units" ON public.units FOR DELETE USING (is_admin());

CREATE POLICY "Admins/faculty can insert topics" ON public.topics FOR INSERT WITH CHECK (is_admin() OR is_faculty());
CREATE POLICY "Admins/faculty can update topics" ON public.topics FOR UPDATE USING (is_admin() OR is_faculty());
CREATE POLICY "Admins can delete topics" ON public.topics FOR DELETE USING (is_admin());

CREATE POLICY "Admins/faculty can insert lectures" ON public.lectures FOR INSERT WITH CHECK (is_admin() OR is_faculty());
CREATE POLICY "Admins/faculty can update lectures" ON public.lectures FOR UPDATE USING (is_admin() OR is_faculty());
CREATE POLICY "Admins can delete lectures" ON public.lectures FOR DELETE USING (is_admin());

-- Timestamps triggers
CREATE TRIGGER update_degrees_updated_at BEFORE UPDATE ON public.degrees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lectures_updated_at BEFORE UPDATE ON public.lectures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
