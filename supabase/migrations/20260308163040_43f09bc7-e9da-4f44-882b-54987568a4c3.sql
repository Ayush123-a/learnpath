
-- Helper function to get current user's college_id
CREATE OR REPLACE FUNCTION public.user_college_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT college_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- DEGREES: scope by college_id
DROP POLICY IF EXISTS "Anyone can view degrees" ON public.degrees;
CREATE POLICY "Users view own college degrees" ON public.degrees
  FOR SELECT USING (
    is_admin() OR college_id IS NULL OR college_id = user_college_id()
  );

-- QUIZZES: scope SELECT by college_id
DROP POLICY IF EXISTS "Anyone can view published quizzes" ON public.quizzes;
CREATE POLICY "Users view own college published quizzes" ON public.quizzes
  FOR SELECT USING (
    is_admin() OR
    (is_faculty() AND (college_id IS NULL OR college_id = user_college_id())) OR
    (is_published = true AND (college_id IS NULL OR college_id = user_college_id()))
  );

-- BOOKS: scope SELECT by college_id
DROP POLICY IF EXISTS "Anyone can view published books" ON public.books;
CREATE POLICY "Users view own college published books" ON public.books
  FOR SELECT USING (
    is_admin() OR
    (is_faculty() AND (college_id IS NULL OR college_id = user_college_id())) OR
    (is_published = true AND (college_id IS NULL OR college_id = user_college_id()))
  );

-- SESSIONS: scope SELECT by college_id
DROP POLICY IF EXISTS "Authenticated users can view sessions they participate in or cr" ON public.sessions;
CREATE POLICY "Users view own college sessions" ON public.sessions
  FOR SELECT USING (
    is_admin() OR
    auth.uid() = created_by OR
    ((college_id IS NULL OR college_id = user_college_id()) AND (
      is_faculty() OR EXISTS (
        SELECT 1 FROM session_participants sp
        WHERE sp.session_id = sessions.id AND sp.user_id = auth.uid()
      )
    ))
  );

-- ASSIGNMENTS: scope SELECT by college_id
DROP POLICY IF EXISTS "Anyone can view published assignments" ON public.assignments;
CREATE POLICY "Users view own college published assignments" ON public.assignments
  FOR SELECT USING (
    is_admin() OR
    (is_faculty() AND (college_id IS NULL OR college_id = user_college_id())) OR
    (is_published = true AND (college_id IS NULL OR college_id = user_college_id()))
  );

-- NEWS: scope SELECT by college_id
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
CREATE POLICY "Users view own college published news" ON public.news
  FOR SELECT USING (
    is_admin() OR is_content_creator() OR
    (is_published = true AND (college_id IS NULL OR college_id = user_college_id()))
  );

-- NOTIFICATIONS: scope SELECT by college_id
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own college notifications" ON public.notifications
  FOR SELECT USING (
    is_admin() OR
    (
      (college_id IS NULL OR college_id = user_college_id()) AND
      (target_user_id = auth.uid() OR target_role IS NULL OR target_role IN (
        SELECT role::text FROM user_roles WHERE user_id = auth.uid()
      ))
    )
  );
