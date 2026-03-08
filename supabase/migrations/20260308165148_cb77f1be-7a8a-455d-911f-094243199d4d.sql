
-- Faculty-subject assignment table
CREATE TABLE public.faculty_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  UNIQUE (faculty_user_id, subject_id)
);

ALTER TABLE public.faculty_subjects ENABLE ROW LEVEL SECURITY;

-- College admins can manage their college's faculty assignments
CREATE POLICY "College admins manage faculty assignments"
  ON public.faculty_subjects FOR ALL
  TO authenticated
  USING (is_admin() OR (is_college_admin() AND college_id = user_college_id()))
  WITH CHECK (is_admin() OR (is_college_admin() AND college_id = user_college_id()));

-- Faculty can view their own assignments
CREATE POLICY "Faculty view own assignments"
  ON public.faculty_subjects FOR SELECT
  TO authenticated
  USING (faculty_user_id = auth.uid());

-- Students can view faculty assignments (to see who teaches what)
CREATE POLICY "Students view college faculty assignments"
  ON public.faculty_subjects FOR SELECT
  TO authenticated
  USING (college_id = user_college_id());
