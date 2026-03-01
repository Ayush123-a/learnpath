
-- Subscription plans (seeded with Free, Monthly, Yearly)
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  duration_days integer, -- null = unlimited for free, 30 for monthly, 365 for yearly
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  trial_days integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (is_admin());

-- Seed default plans
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_total, duration_days, trial_days, sort_order, features) VALUES
('Free', 'free', 0, 0, NULL, 0, 0, '["Access to free lectures","Limited mock tests","Basic GPA calculator","5 AI doubt queries/day"]'::jsonb),
('Monthly', 'monthly', 299, 299, 30, 7, 1, '["All video lectures","Unlimited mock tests","Full digital library","Unlimited AI doubts","Download notes & PPTs","Priority support"]'::jsonb),
('Yearly', 'yearly', 199, 2388, 365, 7, 2, '["Everything in Monthly","33% savings","Exam prediction score","Personalized study plan","Offline downloads","Certificate of completion"]'::jsonb);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active', -- active, expired, cancelled, trial
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  trial_ends_at timestamptz,
  payment_method text DEFAULT 'mock',
  payment_reference text,
  coupon_id uuid,
  amount_paid numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users create own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins can delete subscriptions" ON public.user_subscriptions FOR DELETE USING (is_admin());

-- Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage', -- percentage, fixed
  discount_value numeric NOT NULL DEFAULT 0,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  applicable_plan_slugs text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (is_admin());

-- Seed sample coupons
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, valid_until, applicable_plan_slugs) VALUES
('WELCOME50', 'percentage', 50, 100, now() + interval '90 days', '{monthly,yearly}'),
('FLAT100', 'fixed', 100, 50, now() + interval '60 days', '{yearly}'),
('STUDENT20', 'percentage', 20, NULL, now() + interval '365 days', '{monthly,yearly}');

-- Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  reward_type text DEFAULT 'days', -- days, discount
  reward_value numeric DEFAULT 7,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR is_admin());
CREATE POLICY "Users create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "System updates referrals" ON public.referrals FOR UPDATE USING (auth.uid() = referrer_id OR is_admin());

-- Trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
