-- News/announcements table
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  image_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published news" ON public.news
  FOR SELECT USING (is_published = true OR is_admin() OR is_content_creator());

CREATE POLICY "Content creators/admin can insert news" ON public.news
  FOR INSERT WITH CHECK (is_admin() OR is_content_creator());

CREATE POLICY "Content creators/admin can update news" ON public.news
  FOR UPDATE USING (is_admin() OR (is_content_creator() AND auth.uid() = created_by));

CREATE POLICY "Admin can delete news" ON public.news
  FOR DELETE USING (is_admin());

-- Storage bucket for content uploads (books, images)
INSERT INTO storage.buckets (id, name, public) VALUES ('content-uploads', 'content-uploads', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload content" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-uploads');

CREATE POLICY "Anyone can view content uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-uploads');

CREATE POLICY "Owners can delete content uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'content-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);