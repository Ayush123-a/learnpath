-- Run this script in your Supabase SQL Editor to update the signup trigger function.
-- This ensures that college_id, student_id, and role requests are populated
-- automatically when a user signs up, even when email confirmation is active.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, approval_status, college_id, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    'pending',
    (NEW.raw_user_meta_data->>'college_id')::uuid,
    NEW.raw_user_meta_data->>'student_id'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Auto-assign student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Auto-create role request if requested_role is specified and not student
  IF NEW.raw_user_meta_data->>'requested_role' IS NOT NULL AND NEW.raw_user_meta_data->>'requested_role' != 'student' THEN
    INSERT INTO public.role_requests (user_id, requested_role, status)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'requested_role', 'pending')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
