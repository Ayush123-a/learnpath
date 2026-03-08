CREATE POLICY "Faculty/admin can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (is_faculty() OR is_admin());