
-- Parent-student relationship table
CREATE TABLE public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own links" ON public.parent_students
  FOR SELECT USING (auth.uid() = parent_id OR public.is_admin());

CREATE POLICY "Admins can manage parent links" ON public.parent_students
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete parent links" ON public.parent_students
  FOR DELETE USING (public.is_admin());

-- Attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  marked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = student_id OR public.is_faculty() OR public.is_admin());

CREATE POLICY "Faculty/admin can insert attendance" ON public.attendance
  FOR INSERT WITH CHECK (public.is_faculty() OR public.is_admin());

CREATE POLICY "Faculty/admin can update attendance" ON public.attendance
  FOR UPDATE USING (public.is_faculty() OR public.is_admin());

-- Parents can view their linked students' attendance
CREATE POLICY "Parents view linked student attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_id = auth.uid() AND ps.student_id = attendance.student_id
    )
  );

-- Study sessions tracking
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents view linked student sessions" ON public.study_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_id = auth.uid() AND ps.student_id = study_sessions.user_id
    )
  );

-- Parents can also view linked students' quiz attempts
CREATE POLICY "Parents view linked student quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_id = auth.uid() AND ps.student_id = quiz_attempts.user_id
    )
  );
