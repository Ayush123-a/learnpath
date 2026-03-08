
-- Allow anyone to insert a college (self-registration) but only as inactive
DROP POLICY IF EXISTS "Platform admin manages colleges" ON public.colleges;

CREATE POLICY "Platform admin manages colleges" ON public.colleges
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Anyone can register a college" ON public.colleges
  FOR INSERT WITH CHECK (is_active = false);
