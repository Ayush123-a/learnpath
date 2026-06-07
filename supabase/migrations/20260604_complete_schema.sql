-- =============================================================
-- LearnPath - Complete Database Schema + RLS + Seed Data
-- Run this in Supabase SQL Editor to set up the full database
-- =============================================================

-- ========================
-- ENUMS
-- ========================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'student', 'faculty', 'admin', 'parent', 'content_creator', 'college_admin'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ========================
-- HELPER FUNCTIONS (needed by RLS policies)
-- ========================

CREATE OR REPLACE FUNCTION public.get_user_college_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT college_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_college_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT college_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT has_role('admin', auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT has_role('faculty', auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.is_college_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT has_role('college_admin', auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.is_content_creator()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT has_role('content_creator', auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT has_role('parent', auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT has_role('student', auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.same_college(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (SELECT college_id FROM public.profiles WHERE user_id = auth.uid()) =
         (SELECT college_id FROM public.profiles WHERE user_id = _user_id);
$$;

-- ========================
-- TABLES
-- ========================

-- colleges
CREATE TABLE IF NOT EXISTS public.colleges (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  code        text NOT NULL UNIQUE,
  description text,
  address     text,
  city        text,
  state       text,
  logo_url    text,
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  phone           text,
  avatar_url      text,
  student_id      text,
  college_id      uuid REFERENCES public.colleges(id),
  approval_status text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- role_requests
CREATE TABLE IF NOT EXISTS public.role_requests (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL,
  status         text NOT NULL DEFAULT 'pending',
  reviewed_by    uuid,
  reviewed_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- degrees
CREATE TABLE IF NOT EXISTS public.degrees (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id     uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  name           text NOT NULL,
  code           text NOT NULL,
  description    text,
  duration_years int  NOT NULL DEFAULT 3,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- years
CREATE TABLE IF NOT EXISTS public.years (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_id   uuid NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  year_number int NOT NULL,
  label       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- semesters
CREATE TABLE IF NOT EXISTS public.semesters (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year_id         uuid NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
  semester_number int NOT NULL,
  label           text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id uuid NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name        text NOT NULL,
  code        text NOT NULL,
  description text,
  credits     int NOT NULL DEFAULT 4,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- units
CREATE TABLE IF NOT EXISTS public.units (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id  uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  unit_number int NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- topics
CREATE TABLE IF NOT EXISTS public.topics (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id      uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  topic_number int NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- lectures
CREATE TABLE IF NOT EXISTS public.lectures (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id         uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title            text NOT NULL,
  type             text NOT NULL DEFAULT 'video',
  video_url        text,
  pdf_url          text,
  duration_minutes int,
  sort_order       int NOT NULL DEFAULT 0,
  is_free          boolean NOT NULL DEFAULT false,
  is_published     boolean NOT NULL DEFAULT false,
  created_by       uuid REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id uuid NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lecture_id)
);

-- books
CREATE TABLE IF NOT EXISTS public.books (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title              text NOT NULL,
  author             text NOT NULL,
  description        text,
  cover_url          text,
  file_url           text,
  file_type          text NOT NULL DEFAULT 'pdf',
  book_type          text NOT NULL DEFAULT 'textbook',
  isbn               text,
  publication        text,
  edition            text,
  total_pages        int,
  free_preview_pages int,
  is_free            boolean NOT NULL DEFAULT false,
  is_required        boolean NOT NULL DEFAULT false,
  is_published       boolean NOT NULL DEFAULT false,
  subject_id         uuid REFERENCES public.subjects(id),
  semester_id        uuid REFERENCES public.semesters(id),
  degree_id          uuid REFERENCES public.degrees(id),
  college_id         uuid REFERENCES public.colleges(id),
  tags               text[],
  uploaded_by        uuid REFERENCES auth.users(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- reading_progress
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id      uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  current_page int NOT NULL DEFAULT 1,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- book_annotations
CREATE TABLE IF NOT EXISTS public.book_annotations (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id         uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number     int NOT NULL,
  annotation_type text NOT NULL DEFAULT 'highlight',
  content         text,
  color           text,
  position_data   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title                text NOT NULL,
  description          text,
  subject_id           uuid REFERENCES public.subjects(id),
  unit_id              uuid REFERENCES public.units(id),
  college_id           uuid REFERENCES public.colleges(id),
  quiz_type            text NOT NULL DEFAULT 'practice',
  duration_minutes     int NOT NULL DEFAULT 30,
  total_marks          int NOT NULL DEFAULT 100,
  negative_marking     boolean NOT NULL DEFAULT false,
  negative_mark_value  numeric NOT NULL DEFAULT 0.25,
  is_published         boolean NOT NULL DEFAULT false,
  created_by           uuid REFERENCES auth.users(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- questions
CREATE TABLE IF NOT EXISTS public.questions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id       uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'mcq',
  options       jsonb,
  correct_answer text NOT NULL,
  explanation   text,
  marks         int NOT NULL DEFAULT 1,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id      uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  answers      jsonb,
  score        numeric,
  total_marks  numeric,
  is_completed boolean NOT NULL DEFAULT false,
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date       date NOT NULL,
  status     text NOT NULL DEFAULT 'present',
  marked_by  uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- study_sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id       uuid REFERENCES public.subjects(id),
  duration_minutes int NOT NULL DEFAULT 0,
  session_date     date NOT NULL DEFAULT CURRENT_DATE,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- timetable_entries
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  teacher_name text,
  day_of_week  int NOT NULL,
  start_time   text NOT NULL,
  end_time     text NOT NULL,
  room         text,
  color        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id  uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  college_id  uuid REFERENCES public.colleges(id),
  title       text NOT NULL,
  description text,
  due_date    timestamptz,
  max_marks   int NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT false,
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- assignment_submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       text,
  file_url      text,
  grade         numeric,
  feedback      text,
  graded_by     uuid REFERENCES auth.users(id),
  graded_at     timestamptz,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- faculty_subjects
CREATE TABLE IF NOT EXISTS public.faculty_subjects (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id      uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  college_id      uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  assigned_by     uuid REFERENCES auth.users(id),
  assigned_at     timestamptz NOT NULL DEFAULT now()
);

-- news
CREATE TABLE IF NOT EXISTS public.news (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  content     text NOT NULL,
  category    text NOT NULL DEFAULT 'general',
  image_url   text,
  college_id  uuid REFERENCES public.colleges(id),
  is_published boolean NOT NULL DEFAULT false,
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title          text NOT NULL,
  message        text NOT NULL,
  sent_by        uuid NOT NULL REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  target_role    text,
  college_id     uuid REFERENCES public.colleges(id),
  is_read        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- parent_students
CREATE TABLE IF NOT EXISTS public.parent_students (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- sessions (live sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title           text NOT NULL,
  description     text,
  session_type    text NOT NULL DEFAULT 'live',
  subject_id      uuid REFERENCES public.subjects(id),
  college_id      uuid REFERENCES public.colleges(id),
  invite_code     text NOT NULL UNIQUE,
  scheduled_at    timestamptz NOT NULL,
  duration_minutes int,
  meeting_link    text,
  recording_link  text,
  materials_url   text,
  notes_content   text,
  status          text NOT NULL DEFAULT 'scheduled',
  ended_at        timestamptz,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- session_participants
CREATE TABLE IF NOT EXISTS public.session_participants (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id        uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at         timestamptz NOT NULL DEFAULT now(),
  attendance_marked boolean NOT NULL DEFAULT false,
  UNIQUE(session_id, user_id)
);

-- subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_total   numeric NOT NULL DEFAULT 0,
  currency      text NOT NULL DEFAULT 'INR',
  duration_days int,
  features      jsonb NOT NULL DEFAULT '[]',
  trial_days    int NOT NULL DEFAULT 0,
  sort_order    int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id           uuid NOT NULL REFERENCES public.subscription_plans(id),
  status            text NOT NULL DEFAULT 'active',
  starts_at         timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz,
  trial_ends_at     timestamptz,
  amount_paid       numeric NOT NULL DEFAULT 0,
  coupon_id         uuid,
  payment_method    text,
  payment_reference text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code                  text NOT NULL UNIQUE,
  discount_type         text NOT NULL DEFAULT 'percentage',
  discount_value        numeric NOT NULL DEFAULT 0,
  applicable_plan_slugs text[],
  max_uses              int,
  current_uses          int NOT NULL DEFAULT 0,
  valid_from            timestamptz NOT NULL DEFAULT now(),
  valid_until           timestamptz,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id   uuid REFERENCES auth.users(id),
  referral_code text NOT NULL UNIQUE,
  status        text NOT NULL DEFAULT 'pending',
  reward_type   text,
  reward_value  numeric,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ========================
-- TRIGGERS (auto-update updated_at)
-- ========================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','colleges','degrees','subjects','books','quizzes',
    'lectures','assignments','assignment_submissions','sessions',
    'news','timetable_entries','user_subscriptions'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON public.%I;
      CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- Auto-create profile on signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- ROW LEVEL SECURITY
-- ========================
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies so we can recreate cleanly
DO $$ DECLARE
  r record;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- COLLEGES
CREATE POLICY "Anyone can read active colleges" ON public.colleges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage colleges" ON public.colleges FOR ALL USING (is_admin());

-- PROFILES
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System inserts profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin reads all profiles" ON public.profiles FOR SELECT USING (is_admin() OR is_college_admin());

-- USER_ROLES
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (is_admin() OR is_college_admin());

-- ROLE_REQUESTS
CREATE POLICY "Users manage own requests" ON public.role_requests FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins view all requests" ON public.role_requests FOR SELECT USING (is_admin() OR is_college_admin());
CREATE POLICY "Admins update requests" ON public.role_requests FOR UPDATE USING (is_admin() OR is_college_admin());

-- DEGREES
CREATE POLICY "Anyone views active degrees" ON public.degrees FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage degrees" ON public.degrees FOR ALL USING (is_admin() OR is_college_admin());

-- YEARS
CREATE POLICY "Anyone views years" ON public.years FOR SELECT USING (true);
CREATE POLICY "Admins manage years" ON public.years FOR ALL USING (is_admin() OR is_college_admin());

-- SEMESTERS
CREATE POLICY "Anyone views semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Admins manage semesters" ON public.semesters FOR ALL USING (is_admin() OR is_college_admin());

-- SUBJECTS
CREATE POLICY "Anyone views active subjects" ON public.subjects FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (is_admin() OR is_college_admin() OR is_faculty());

-- UNITS & TOPICS
CREATE POLICY "Anyone views units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Faculty manages units" ON public.units FOR ALL USING (is_admin() OR is_faculty());
CREATE POLICY "Anyone views topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Faculty manages topics" ON public.topics FOR ALL USING (is_admin() OR is_faculty());

-- LECTURES
CREATE POLICY "Published lectures visible to all" ON public.lectures FOR SELECT USING (is_published = true OR is_admin() OR is_faculty());
CREATE POLICY "Faculty manages lectures" ON public.lectures FOR ALL USING (is_admin() OR is_faculty());

-- BOOKMARKS
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (user_id = auth.uid());

-- BOOKS
CREATE POLICY "Published books visible to all" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage books" ON public.books FOR ALL USING (is_admin() OR is_content_creator());

-- READING_PROGRESS & ANNOTATIONS
CREATE POLICY "Users manage own reading progress" ON public.reading_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own annotations" ON public.book_annotations FOR ALL USING (user_id = auth.uid());

-- QUIZZES
CREATE POLICY "Published quizzes visible" ON public.quizzes FOR SELECT USING (is_published = true OR is_admin() OR is_faculty());
CREATE POLICY "Faculty manages quizzes" ON public.quizzes FOR ALL USING (is_admin() OR is_faculty());

-- QUESTIONS
CREATE POLICY "Anyone reads questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Faculty manages questions" ON public.questions FOR ALL USING (is_admin() OR is_faculty());

-- QUIZ_ATTEMPTS
CREATE POLICY "Users manage own attempts" ON public.quiz_attempts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Faculty views attempts" ON public.quiz_attempts FOR SELECT USING (is_admin() OR is_faculty());

-- ATTENDANCE
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Faculty manages attendance" ON public.attendance FOR ALL USING (is_admin() OR is_faculty() OR is_college_admin());

-- STUDY_SESSIONS
CREATE POLICY "Users manage own study sessions" ON public.study_sessions FOR ALL USING (user_id = auth.uid());

-- TIMETABLE_ENTRIES
CREATE POLICY "Users manage own timetable" ON public.timetable_entries FOR ALL USING (user_id = auth.uid());

-- ASSIGNMENTS
CREATE POLICY "Published assignments visible" ON public.assignments FOR SELECT USING (is_published = true OR is_faculty() OR is_admin());
CREATE POLICY "Faculty manages assignments" ON public.assignments FOR ALL USING (is_admin() OR is_faculty());

-- ASSIGNMENT_SUBMISSIONS
CREATE POLICY "Users manage own submissions" ON public.assignment_submissions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Faculty views submissions" ON public.assignment_submissions FOR SELECT USING (is_admin() OR is_faculty());
CREATE POLICY "Faculty grades submissions" ON public.assignment_submissions FOR UPDATE USING (is_admin() OR is_faculty());

-- FACULTY_SUBJECTS
CREATE POLICY "Anyone views faculty subjects" ON public.faculty_subjects FOR SELECT USING (true);
CREATE POLICY "Admins manage faculty subjects" ON public.faculty_subjects FOR ALL USING (is_admin() OR is_college_admin());

-- NEWS
CREATE POLICY "Published news visible to all" ON public.news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage news" ON public.news FOR ALL USING (is_admin() OR is_content_creator() OR is_college_admin());

-- NOTIFICATIONS
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  USING (target_user_id = auth.uid() OR target_role IS NOT NULL);
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL USING (is_admin() OR is_college_admin());
CREATE POLICY "Users mark own notifications read" ON public.notifications FOR UPDATE
  USING (target_user_id = auth.uid());
CREATE POLICY "Users insert notifications" ON public.notifications FOR INSERT WITH CHECK (sent_by = auth.uid());

-- PARENT_STUDENTS
CREATE POLICY "Parents manage own links" ON public.parent_students FOR ALL USING (parent_id = auth.uid());
CREATE POLICY "Students see their parent links" ON public.parent_students FOR SELECT USING (student_id = auth.uid());

-- SESSIONS (live)
CREATE POLICY "Anyone views active sessions" ON public.sessions FOR SELECT USING (status IN ('scheduled','live'));
CREATE POLICY "Faculty manages sessions" ON public.sessions FOR ALL USING (is_admin() OR is_faculty());

-- SESSION_PARTICIPANTS
CREATE POLICY "Users manage own participation" ON public.session_participants FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Faculty views participants" ON public.session_participants FOR SELECT USING (is_admin() OR is_faculty());

-- SUBSCRIPTION_PLANS
CREATE POLICY "Anyone views active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL USING (is_admin());

-- USER_SUBSCRIPTIONS
CREATE POLICY "Users manage own subscriptions" ON public.user_subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins view all subscriptions" ON public.user_subscriptions FOR SELECT USING (is_admin());

-- COUPONS
CREATE POLICY "Anyone reads active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (is_admin());

-- REFERRALS
CREATE POLICY "Users manage own referrals" ON public.referrals FOR ALL USING (referrer_id = auth.uid());

-- ========================
-- SEED DATA
-- ========================

-- Subscription Plans
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_total, currency, duration_days, features, trial_days, sort_order, is_active)
VALUES
  ('Free', 'free', 0, 0, 'INR', NULL,
    '["Access to free lectures","Basic quizzes","Community support"]'::jsonb,
    0, 1, true),
  ('Student Pro', 'student-pro', 299, 2499, 'INR', 365,
    '["All video lectures","All notes & PPTs","Unlimited mock tests","AI doubt solver","GPA calculator","Digital library","Priority support"]'::jsonb,
    7, 2, true),
  ('Institution', 'institution', 0, 9999, 'INR', 365,
    '["Everything in Pro","Faculty management","College branding","Analytics dashboard","Bulk user management","Custom notifications","Dedicated support"]'::jsonb,
    0, 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Sample College
INSERT INTO public.colleges (name, code, description, city, state, is_active)
VALUES
  ('LearnPath Demo University', 'LPDU', 'The official demo college for LearnPath platform', 'New Delhi', 'Delhi', true),
  ('Sunrise College of Technology', 'SCT', 'Premier technology college in Bangalore', 'Bangalore', 'Karnataka', true),
  ('National Institute of Commerce', 'NIC', 'Top commerce college in Mumbai', 'Mumbai', 'Maharashtra', true)
ON CONFLICT (code) DO NOTHING;

-- Sample BCA Degree + full hierarchy
DO $$
DECLARE
  v_college_id uuid;
  v_degree_id  uuid;
  v_year_id    uuid;
  v_sem_id     uuid;
  v_subj_id    uuid;
  v_unit_id    uuid;
  v_topic_id   uuid;
BEGIN
  SELECT id INTO v_college_id FROM public.colleges WHERE code = 'LPDU' LIMIT 1;

  -- BCA Degree
  INSERT INTO public.degrees (college_id, name, code, description, duration_years, is_active)
  VALUES (v_college_id, 'Bachelor of Computer Applications', 'BCA', 'A 3-year undergraduate degree in computer applications', 3, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_degree_id;

  IF v_degree_id IS NULL THEN
    SELECT id INTO v_degree_id FROM public.degrees WHERE code = 'BCA' AND college_id = v_college_id LIMIT 1;
  END IF;

  -- Year 1
  INSERT INTO public.years (degree_id, year_number, label) VALUES (v_degree_id, 1, 'First Year')
  ON CONFLICT DO NOTHING RETURNING id INTO v_year_id;
  IF v_year_id IS NULL THEN SELECT id INTO v_year_id FROM public.years WHERE degree_id = v_degree_id AND year_number = 1 LIMIT 1; END IF;

  -- Semester 1
  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 1, 'Semester 1')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 1 LIMIT 1; END IF;

  -- Subject: Programming Fundamentals
  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES (v_sem_id, 'Programming Fundamentals with C', 'BCA101', 'Introduction to programming using C language', 4, true)
  ON CONFLICT DO NOTHING RETURNING id INTO v_subj_id;
  IF v_subj_id IS NULL THEN SELECT id INTO v_subj_id FROM public.subjects WHERE semester_id = v_sem_id AND code = 'BCA101' LIMIT 1; END IF;

  -- Unit 1
  INSERT INTO public.units (subject_id, title, description, unit_number)
  VALUES (v_subj_id, 'Introduction to C Programming', 'Basic concepts of C language', 1)
  ON CONFLICT DO NOTHING RETURNING id INTO v_unit_id;
  IF v_unit_id IS NULL THEN SELECT id INTO v_unit_id FROM public.units WHERE subject_id = v_subj_id AND unit_number = 1 LIMIT 1; END IF;

  -- Topic 1
  INSERT INTO public.topics (unit_id, title, description, topic_number)
  VALUES (v_unit_id, 'History of C Language', 'Origin and evolution of C', 1)
  ON CONFLICT DO NOTHING RETURNING id INTO v_topic_id;

  -- Subject: Mathematics
  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES (v_sem_id, 'Mathematics for Computing', 'BCA102', 'Discrete mathematics and calculus for computer science', 4, true)
  ON CONFLICT DO NOTHING;

  -- Subject: IT Fundamentals
  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES (v_sem_id, 'IT Fundamentals', 'BCA103', 'Computer hardware, OS, and networking basics', 3, true)
  ON CONFLICT DO NOTHING;

  -- Semester 2
  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 2, 'Semester 2')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 2 LIMIT 1; END IF;

  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES
    (v_sem_id, 'Data Structures', 'BCA201', 'Arrays, linked lists, stacks, queues, trees, graphs', 4, true),
    (v_sem_id, 'Object Oriented Programming', 'BCA202', 'OOP concepts using Java', 4, true),
    (v_sem_id, 'Web Technologies', 'BCA203', 'HTML, CSS, JavaScript, and basic PHP', 3, true)
  ON CONFLICT DO NOTHING;

  -- Year 2
  INSERT INTO public.years (degree_id, year_number, label) VALUES (v_degree_id, 2, 'Second Year')
  ON CONFLICT DO NOTHING RETURNING id INTO v_year_id;
  IF v_year_id IS NULL THEN SELECT id INTO v_year_id FROM public.years WHERE degree_id = v_degree_id AND year_number = 2 LIMIT 1; END IF;

  -- Semester 3
  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 3, 'Semester 3')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 3 LIMIT 1; END IF;

  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES
    (v_sem_id, 'Database Management Systems', 'BCA301', 'SQL, normalization, transactions, and database design', 4, true),
    (v_sem_id, 'Computer Networks', 'BCA302', 'OSI model, TCP/IP, routing, and protocols', 4, true),
    (v_sem_id, 'Operating Systems', 'BCA303', 'Process management, memory management, file systems', 4, true)
  ON CONFLICT DO NOTHING;

  -- Semester 4
  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 4, 'Semester 4')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 4 LIMIT 1; END IF;

  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES
    (v_sem_id, 'Software Engineering', 'BCA401', 'SDLC, Agile, design patterns, and project management', 4, true),
    (v_sem_id, 'Python Programming', 'BCA402', 'Python basics to advanced with libraries', 4, true),
    (v_sem_id, 'Computer Graphics', 'BCA403', '2D and 3D graphics, transformations, OpenGL', 3, true)
  ON CONFLICT DO NOTHING;

  -- Year 3
  INSERT INTO public.years (degree_id, year_number, label) VALUES (v_degree_id, 3, 'Third Year')
  ON CONFLICT DO NOTHING RETURNING id INTO v_year_id;
  IF v_year_id IS NULL THEN SELECT id INTO v_year_id FROM public.years WHERE degree_id = v_degree_id AND year_number = 3 LIMIT 1; END IF;

  -- Semester 5
  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 5, 'Semester 5')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 5 LIMIT 1; END IF;

  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES
    (v_sem_id, 'Artificial Intelligence', 'BCA501', 'AI concepts, search algorithms, expert systems, ML intro', 4, true),
    (v_sem_id, 'Mobile App Development', 'BCA502', 'Android and iOS development using React Native', 4, true),
    (v_sem_id, 'Cloud Computing', 'BCA503', 'AWS, Azure, GCP concepts and deployment', 4, true)
  ON CONFLICT DO NOTHING;

  -- Semester 6
  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 6, 'Semester 6')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 6 LIMIT 1; END IF;

  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES
    (v_sem_id, 'Project Work', 'BCA601', 'Major project and dissertation', 6, true),
    (v_sem_id, 'Cybersecurity', 'BCA602', 'Network security, cryptography, ethical hacking', 4, true),
    (v_sem_id, 'Machine Learning', 'BCA603', 'Supervised, unsupervised learning, neural networks', 4, true)
  ON CONFLICT DO NOTHING;

  -- BBA Degree
  INSERT INTO public.degrees (college_id, name, code, description, duration_years, is_active)
  VALUES (v_college_id, 'Bachelor of Business Administration', 'BBA', 'Management and business administration degree', 3, true)
  ON CONFLICT DO NOTHING RETURNING id INTO v_degree_id;

  IF v_degree_id IS NULL THEN
    SELECT id INTO v_degree_id FROM public.degrees WHERE code = 'BBA' AND college_id = v_college_id LIMIT 1;
  END IF;

  -- BBA Year 1
  INSERT INTO public.years (degree_id, year_number, label) VALUES (v_degree_id, 1, 'First Year')
  ON CONFLICT DO NOTHING RETURNING id INTO v_year_id;
  IF v_year_id IS NULL THEN SELECT id INTO v_year_id FROM public.years WHERE degree_id = v_degree_id AND year_number = 1 LIMIT 1; END IF;

  INSERT INTO public.semesters (year_id, semester_number, label) VALUES (v_year_id, 1, 'Semester 1')
  ON CONFLICT DO NOTHING RETURNING id INTO v_sem_id;
  IF v_sem_id IS NULL THEN SELECT id INTO v_sem_id FROM public.semesters WHERE year_id = v_year_id AND semester_number = 1 LIMIT 1; END IF;

  INSERT INTO public.subjects (semester_id, name, code, description, credits, is_active)
  VALUES
    (v_sem_id, 'Principles of Management', 'BBA101', 'Fundamentals of management and organization', 4, true),
    (v_sem_id, 'Business Economics', 'BBA102', 'Micro and macro economics for business', 4, true),
    (v_sem_id, 'Business Communication', 'BBA103', 'Written and verbal communication skills', 3, true)
  ON CONFLICT DO NOTHING;

  -- MCA Degree
  INSERT INTO public.degrees (college_id, name, code, description, duration_years, is_active)
  VALUES (v_college_id, 'Master of Computer Applications', 'MCA', '2-year postgraduate degree in computer applications', 2, true)
  ON CONFLICT DO NOTHING;

  -- MBA Degree
  INSERT INTO public.degrees (college_id, name, code, description, duration_years, is_active)
  VALUES (v_college_id, 'Master of Business Administration', 'MBA', '2-year postgraduate management degree', 2, true)
  ON CONFLICT DO NOTHING;

  -- BCom Degree
  INSERT INTO public.degrees (college_id, name, code, description, duration_years, is_active)
  VALUES (v_college_id, 'Bachelor of Commerce', 'BCom', '3-year undergraduate commerce degree', 3, true)
  ON CONFLICT DO NOTHING;

END $$;

-- Sample News
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.news (title, content, category, is_published, created_by)
    VALUES
      ('Welcome to LearnPath!',
       'We are excited to launch LearnPath — India''s most comprehensive university learning platform. Access thousands of lectures, notes, mock tests, and AI-powered doubt solving all in one place.',
       'announcement', true, v_admin_id),
      ('New BCA Courses Added',
       'We have added complete BCA semester-wise courses including Programming Fundamentals, Data Structures, DBMS, Computer Networks, and more. Start learning today!',
       'academic', true, v_admin_id),
      ('Mock Test Series Now Live',
       'Practice with our comprehensive mock test series covering all subjects. Get detailed analytics and performance tracking to identify your weak areas.',
       'academic', true, v_admin_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ========================
-- STORAGE BUCKETS (run separately if needed)
-- ========================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('content-uploads', 'content-uploads', true) ON CONFLICT DO NOTHING;

-- DONE
SELECT 'LearnPath database schema setup complete!' AS status;
