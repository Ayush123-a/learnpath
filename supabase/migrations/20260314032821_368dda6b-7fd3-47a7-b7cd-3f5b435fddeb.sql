
-- Add approval_status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- Update existing profiles to 'approved' so current users aren't locked out
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_college_approval ON public.profiles(college_id, approval_status);
