INSERT INTO public.user_roles (user_id, role)
SELECT '57677e9d-461f-4900-b64b-dd8eb74b79ca', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = '57677e9d-461f-4900-b64b-dd8eb74b79ca' AND role = 'admin'
);