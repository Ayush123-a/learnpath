
-- Allow college_admin to manage users in their college (view profiles)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own or college profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR is_admin() OR
    (is_college_admin() AND college_id = user_college_id())
  );

-- Allow college_admin to update profiles in their college
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own or college profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR is_admin() OR
    (is_college_admin() AND college_id = user_college_id())
  );

-- Allow college_admin to view user_roles for their college users
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own or college roles" ON public.user_roles
  FOR SELECT USING (
    auth.uid() = user_id OR is_admin() OR
    (is_college_admin() AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = user_roles.user_id AND p.college_id = user_college_id()
    ))
  );

-- Allow college_admin to assign roles within their college
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
CREATE POLICY "Admins or college admins can assign roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    is_admin() OR
    (is_college_admin() AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = user_roles.user_id AND p.college_id = user_college_id()
    ))
  );

-- Allow college_admin to remove roles within their college
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins or college admins can delete roles" ON public.user_roles
  FOR DELETE USING (
    is_admin() OR
    (is_college_admin() AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = user_roles.user_id AND p.college_id = user_college_id()
    ))
  );

-- Allow college_admin to manage degrees for their college
DROP POLICY IF EXISTS "Admins/faculty can insert degrees" ON public.degrees;
CREATE POLICY "Admins or college admins can insert degrees" ON public.degrees
  FOR INSERT WITH CHECK (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admins/faculty can update degrees" ON public.degrees;
CREATE POLICY "Admins or college admins can update degrees" ON public.degrees
  FOR UPDATE USING (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admins can delete degrees" ON public.degrees;
CREATE POLICY "Admins or college admins can delete degrees" ON public.degrees
  FOR DELETE USING (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

-- Allow college_admin to manage books for their college
DROP POLICY IF EXISTS "Admin/faculty can insert books" ON public.books;
CREATE POLICY "Admins or college admins can insert books" ON public.books
  FOR INSERT WITH CHECK (
    is_admin() OR is_faculty() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admin/faculty can update books" ON public.books;
CREATE POLICY "Admins or college admins can update books" ON public.books
  FOR UPDATE USING (
    is_admin() OR is_faculty() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admin can delete books" ON public.books;
CREATE POLICY "Admins or college admins can delete books" ON public.books
  FOR DELETE USING (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

-- Allow college_admin to send notifications for their college
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins or college admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins or college admins can delete notifications" ON public.notifications
  FOR DELETE USING (
    is_admin() OR (is_college_admin() AND (college_id = user_college_id()))
  );

-- Allow college_admin to manage quizzes for their college
DROP POLICY IF EXISTS "Admin/faculty can insert quizzes" ON public.quizzes;
CREATE POLICY "Admins college admins or faculty can insert quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (
    is_admin() OR is_faculty() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admin/faculty can update quizzes" ON public.quizzes;
CREATE POLICY "Admins college admins or faculty can update quizzes" ON public.quizzes
  FOR UPDATE USING (
    is_admin() OR is_faculty() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admin can delete quizzes" ON public.quizzes;
CREATE POLICY "Admins or college admins can delete quizzes" ON public.quizzes
  FOR DELETE USING (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

-- Allow college_admin to manage assignments for their college
DROP POLICY IF EXISTS "Faculty/admin can insert assignments" ON public.assignments;
CREATE POLICY "Admins college admins or faculty can insert assignments" ON public.assignments
  FOR INSERT WITH CHECK (
    is_admin() OR is_faculty() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Faculty/admin can update assignments" ON public.assignments;
CREATE POLICY "Admins college admins or faculty can update assignments" ON public.assignments
  FOR UPDATE USING (
    is_admin() OR is_faculty() OR (is_college_admin() AND college_id = user_college_id())
  );

DROP POLICY IF EXISTS "Admin can delete assignments" ON public.assignments;
CREATE POLICY "Admins or college admins can delete assignments" ON public.assignments
  FOR DELETE USING (
    is_admin() OR (is_college_admin() AND college_id = user_college_id())
  );

-- Update college_admin SELECT for quizzes and books  
DROP POLICY IF EXISTS "Users view own college published quizzes" ON public.quizzes;
CREATE POLICY "Users view own college published quizzes" ON public.quizzes
  FOR SELECT USING (
    is_admin() OR is_college_admin() OR
    (is_faculty() AND (college_id IS NULL OR college_id = user_college_id())) OR
    (is_published = true AND (college_id IS NULL OR college_id = user_college_id()))
  );

DROP POLICY IF EXISTS "Users view own college published books" ON public.books;
CREATE POLICY "Users view own college published books" ON public.books
  FOR SELECT USING (
    is_admin() OR
    (is_college_admin() AND (college_id IS NULL OR college_id = user_college_id())) OR
    (is_faculty() AND (college_id IS NULL OR college_id = user_college_id())) OR
    (is_published = true AND (college_id IS NULL OR college_id = user_college_id()))
  );
