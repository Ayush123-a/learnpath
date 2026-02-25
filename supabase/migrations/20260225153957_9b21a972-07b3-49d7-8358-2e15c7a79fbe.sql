
-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_marks INTEGER NOT NULL DEFAULT 100,
  created_by UUID NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published assignments" ON public.assignments
  FOR SELECT USING ((is_published = true) OR is_admin() OR is_faculty());

CREATE POLICY "Faculty/admin can insert assignments" ON public.assignments
  FOR INSERT WITH CHECK (is_admin() OR is_faculty());

CREATE POLICY "Faculty/admin can update assignments" ON public.assignments
  FOR UPDATE USING (is_admin() OR is_faculty());

CREATE POLICY "Admin can delete assignments" ON public.assignments
  FOR DELETE USING (is_admin());

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  file_url TEXT,
  content TEXT,
  grade NUMERIC,
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own submissions" ON public.assignment_submissions
  FOR SELECT USING ((auth.uid() = user_id) OR is_admin() OR is_faculty());

CREATE POLICY "Students can submit assignments" ON public.assignment_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Faculty/admin can grade submissions" ON public.assignment_submissions
  FOR UPDATE USING (is_admin() OR is_faculty());

CREATE POLICY "Students can update own ungraded submissions" ON public.assignment_submissions
  FOR UPDATE USING ((auth.uid() = user_id) AND grade IS NULL);

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
