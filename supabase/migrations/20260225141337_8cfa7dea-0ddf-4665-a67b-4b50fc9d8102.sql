
-- Books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  edition TEXT,
  publication TEXT,
  isbn TEXT,
  description TEXT,
  cover_url TEXT,
  file_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  book_type TEXT NOT NULL DEFAULT 'textbook',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
  degree_id UUID REFERENCES public.degrees(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  total_pages INTEGER,
  free_preview_pages INTEGER DEFAULT 5,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published books" ON public.books FOR SELECT USING (is_published = true OR is_admin() OR is_faculty());
CREATE POLICY "Admin/faculty can insert books" ON public.books FOR INSERT WITH CHECK (is_admin() OR is_faculty());
CREATE POLICY "Admin/faculty can update books" ON public.books FOR UPDATE USING (is_admin() OR is_faculty());
CREATE POLICY "Admin can delete books" ON public.books FOR DELETE USING (is_admin());

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Book annotations (highlights, notes, bookmarks)
CREATE TABLE public.book_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  annotation_type TEXT NOT NULL DEFAULT 'highlight',
  page_number INTEGER NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#FFEB3B',
  position_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.book_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own annotations" ON public.book_annotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create annotations" ON public.book_annotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own annotations" ON public.book_annotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own annotations" ON public.book_annotations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_book_annotations_updated_at BEFORE UPDATE ON public.book_annotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reading progress
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 1,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress" ON public.reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.reading_progress FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for library files
INSERT INTO storage.buckets (id, name, public) VALUES ('library', 'library', true);

CREATE POLICY "Anyone can read library files" ON storage.objects FOR SELECT USING (bucket_id = 'library');
CREATE POLICY "Admin/faculty can upload library files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'library' AND (public.is_admin() OR public.is_faculty()));
CREATE POLICY "Admin/faculty can update library files" ON storage.objects FOR UPDATE USING (bucket_id = 'library' AND (public.is_admin() OR public.is_faculty()));
CREATE POLICY "Admin can delete library files" ON storage.objects FOR DELETE USING (bucket_id = 'library' AND public.is_admin());
