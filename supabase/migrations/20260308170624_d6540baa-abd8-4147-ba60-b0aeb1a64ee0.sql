
-- Drop existing INSERT policy on books
DROP POLICY IF EXISTS "Admins or college admins can insert books" ON public.books;

-- Create new INSERT policy that includes content_creator
CREATE POLICY "Admins faculty college admins or content creators can insert books"
ON public.books FOR INSERT TO authenticated
WITH CHECK (
  is_admin() OR is_faculty() OR is_content_creator()
  OR (is_college_admin() AND (college_id = user_college_id()))
);

-- Also allow content creators to view their own unpublished books
DROP POLICY IF EXISTS "Users view own college published books" ON public.books;

CREATE POLICY "Users view books"
ON public.books FOR SELECT TO authenticated
USING (
  is_admin()
  OR (is_college_admin() AND ((college_id IS NULL) OR (college_id = user_college_id())))
  OR (is_faculty() AND ((college_id IS NULL) OR (college_id = user_college_id())))
  OR (is_content_creator() AND (uploaded_by = auth.uid()))
  OR ((is_published = true) AND ((college_id IS NULL) OR (college_id = user_college_id())))
);
