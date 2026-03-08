-- Add student_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id text UNIQUE;

-- Create role_requests table for self-signup approval
CREATE TABLE public.role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, requested_role)
);

ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view own requests
CREATE POLICY "Users view own role requests" ON public.role_requests
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Users can create requests
CREATE POLICY "Users create role requests" ON public.role_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can update requests
CREATE POLICY "Admins update role requests" ON public.role_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete requests
CREATE POLICY "Admins delete role requests" ON public.role_requests
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));