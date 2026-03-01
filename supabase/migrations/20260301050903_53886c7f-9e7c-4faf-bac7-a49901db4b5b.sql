
-- Notifications table for admin push notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_role text, -- null = all users, or specific role
  target_user_id uuid, -- null = broadcast, or specific user
  sent_by uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see notifications targeted to them or their role or broadcast
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (
    target_user_id = auth.uid()
    OR target_role IS NULL
    OR target_role IN (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Users can mark own as read" ON public.notifications
  FOR UPDATE USING (
    target_user_id = auth.uid()
    OR target_role IS NULL
    OR target_role IN (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE USING (is_admin());
