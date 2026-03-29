/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_total: number;
  currency: string;
  duration_days: number | null;
  features: string[];
  trial_days: number;
  sort_order: number;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  trial_ends_at: string | null;
  amount_paid: number;
}

interface CouponResult {
  valid: boolean;
  discount_type?: string;
  discount_value?: number;
  message: string;
}

interface SubscriptionContextType {
  plans: Plan[];
  currentSub: Subscription | null;
  currentPlan: Plan | null;
  isPremium: boolean;
  isTrialing: boolean;
  loading: boolean;
  subscribe: (planId: string, couponCode?: string) => Promise<{ success: boolean; message: string }>;
  cancelSubscription: () => Promise<void>;
  validateCoupon: (code: string, planSlug: string) => Promise<CouponResult>;
  referralCode: string;
  referralCount: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  const fetchPlans = useCallback(async () => {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setPlans(data.map(p => ({ ...p, features: (p.features as string[]) || [] })));
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setCurrentSub(null); setLoading(false); return; }
    const { data } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trial"])
      .order("created_at", { ascending: false })
      .limit(1);
    setCurrentSub(data?.[0] || null);
    setLoading(false);
  }, [user]);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id);
    if (existing && existing.length > 0) {
      setReferralCode(existing[0].referral_code);
      setReferralCount(existing.filter(r => r.status === "completed" || r.status === "rewarded").length);
    } else {
      const code = `REF${user.id.slice(0, 6).toUpperCase()}`;
      await supabase.from("referrals").insert({ referrer_id: user.id, referral_code: code });
      setReferralCode(code);
    }
  }, [user]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);
  useEffect(() => { fetchSubscription(); fetchReferrals(); }, [fetchSubscription, fetchReferrals]);

  const currentPlan = plans.find(p => p.id === currentSub?.plan_id) || null;
  const isPremium = !!currentSub && currentPlan?.slug !== "free";
  const isTrialing = currentSub?.status === "trial";

  const validateCoupon = async (code: string, planSlug: string): Promise<CouponResult> => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();
    if (!data) return { valid: false, message: "Invalid coupon code" };
    if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false, message: "Coupon expired" };
    if (data.max_uses && data.current_uses >= data.max_uses) return { valid: false, message: "Coupon usage limit reached" };
    if (data.applicable_plan_slugs?.length > 0 && !data.applicable_plan_slugs.includes(planSlug))
      return { valid: false, message: "Coupon not valid for this plan" };
    return { valid: true, discount_type: data.discount_type, discount_value: data.discount_value, message: `${data.discount_type === "percentage" ? `${data.discount_value}%` : `₹${data.discount_value}`} off applied!` };
  };

  const subscribe = async (planId: string, couponCode?: string) => {
    if (!user) return { success: false, message: "Please sign in first" };
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, message: "Plan not found" };

    let finalAmount = plan.price_total;
    let couponId: string | undefined;

    if (couponCode) {
      const result = await validateCoupon(couponCode, plan.slug);
      if (!result.valid) return { success: false, message: result.message };
      if (result.discount_type === "percentage") finalAmount = Math.round(finalAmount * (1 - (result.discount_value || 0) / 100));
      else finalAmount = Math.max(0, finalAmount - (result.discount_value || 0));
      const { data: coupon } = await supabase.from("coupons").select("id").eq("code", couponCode.toUpperCase()).single();
      couponId = coupon?.id;
      if (couponId) await supabase.from("coupons").update({ current_uses: (coupon as any).current_uses + 1 }).eq("id", couponId);
    }

    // Try Razorpay first
    if (finalAmount > 0) {
      try {
        const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
          body: { amount: finalAmount, currency: "INR", planName: plan.name, userId: user.id },
        });
        if (!orderError && orderData?.order_id) {
          return new Promise<{ success: boolean; message: string }>((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
              const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Learn Path",
                description: `${plan.name} Plan`,
                order_id: orderData.order_id,
                handler: async (response: any) => {
                  const now = new Date();
                  const expiresAt = plan.duration_days ? new Date(now.getTime() + plan.duration_days * 86400000) : null;
                  await supabase.from("user_subscriptions").insert({
                    user_id: user.id,
                    plan_id: planId,
                    status: "active",
                    starts_at: now.toISOString(),
                    expires_at: expiresAt?.toISOString(),
                    amount_paid: finalAmount,
                    coupon_id: couponId,
                    payment_method: "razorpay",
                    payment_reference: response.razorpay_payment_id,
                  });
                  await fetchSubscription();
                  resolve({ success: true, message: "Payment successful! Subscription activated." });
                },
                modal: { ondismiss: () => resolve({ success: false, message: "Payment cancelled" }) },
                prefill: { email: user.email },
                theme: { color: "#4F46E5" },
              };
              const rzp = new (window as any).Razorpay(options);
              rzp.open();
            };
            script.onerror = () => resolve({ success: false, message: "Failed to load payment gateway" });
            document.body.appendChild(script);
          });
        }
      } catch {
        // Razorpay not configured, fall through to mock
      }
    }

    // Mock fallback
    const now = new Date();
    const isTrialEligible = plan.trial_days > 0;
    const trialEnd = isTrialEligible ? new Date(now.getTime() + plan.trial_days * 86400000) : null;
    const expiresAt = plan.duration_days ? new Date(now.getTime() + plan.duration_days * 86400000) : null;

    const { error } = await supabase.from("user_subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      status: isTrialEligible ? "trial" : "active",
      starts_at: now.toISOString(),
      expires_at: expiresAt?.toISOString(),
      trial_ends_at: trialEnd?.toISOString(),
      amount_paid: finalAmount,
      coupon_id: couponId,
      payment_method: "mock",
      payment_reference: `MOCK_${Date.now()}`,
    });

    if (error) return { success: false, message: error.message };
    await fetchSubscription();
    return { success: true, message: isTrialEligible ? `${plan.trial_days}-day free trial started!` : "Subscription activated!" };
  };

  const cancelSubscription = async () => {
    if (!currentSub) return;
    await supabase.from("user_subscriptions").update({ status: "cancelled" }).eq("id", currentSub.id);
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider value={{ plans, currentSub, currentPlan, isPremium, isTrialing, loading, subscribe, cancelSubscription, validateCoupon, referralCode, referralCount }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};
