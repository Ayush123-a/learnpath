import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Check, Sparkles, Gift, Copy, Users, Tag, Zap, Crown, Star, Infinity } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const planConfig: Record<string, {
  accent: string;
  glow: string;
  icon: typeof Sparkles;
  gradient: string;
  featured?: boolean;
}> = {
  free:     { accent: "#849396", glow: "rgba(132,147,150,0.2)", icon: Star,     gradient: "linear-gradient(135deg, rgba(132,147,150,0.08), transparent)" },
  monthly:  { accent: "#00e5ff", glow: "rgba(0,229,255,0.2)",   icon: Zap,      gradient: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,104,237,0.06))" },
  yearly:   { accent: "#22ef7e", glow: "rgba(34,239,126,0.2)",  icon: Crown,    gradient: "linear-gradient(135deg, rgba(34,239,126,0.15), rgba(0,200,80,0.06))", featured: true },
  lifetime: { accent: "#b0c6ff", glow: "rgba(176,198,255,0.2)", icon: Infinity, gradient: "linear-gradient(135deg, rgba(176,198,255,0.15), rgba(100,120,255,0.06))" },
};

const Pricing = () => {
  const { user } = useAuth();
  const { plans, currentPlan, isPremium, isTrialing, subscribe, cancelSubscription, validateCoupon, referralCode, referralCount } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message: string; discount_type?: string; discount_value?: number } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan?.slug === "free") return;
    setSelectedPlan(planId);
    setCouponCode("");
    setCouponResult(null);
    setCheckoutOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !selectedPlanData) return;
    const result = await validateCoupon(couponCode, selectedPlanData.slug);
    setCouponResult(result);
    if (result.valid) toast.success(result.message);
    else toast.error(result.message);
  };

  const getDiscountedPrice = () => {
    if (!selectedPlanData || !couponResult?.valid) return selectedPlanData?.price_total || 0;
    if (couponResult.discount_type === "percentage")
      return Math.round((selectedPlanData.price_total) * (1 - (couponResult.discount_value || 0) / 100));
    return Math.max(0, (selectedPlanData.price_total) - (couponResult.discount_value || 0));
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    const result = await subscribe(selectedPlan, couponResult?.valid ? couponCode : undefined);
    setProcessing(false);
    if (result.success) {
      toast.success(result.message);
      setCheckoutOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleCancel = async () => {
    await cancelSubscription();
    toast.info("Subscription cancelled");
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 50% -10%, #152d52 0%, #041329 60%)" }}>
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(34,239,126,0.07) 0%, transparent 70%)", animationDelay: "-3s" }} />
        <div className="absolute inset-0 mesh-pattern opacity-40" />
      </div>

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Link to="/dashboard">
            <button className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#849396" }}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="LearnPath" className="h-8 w-8 rounded-xl" />
            <span className="font-bold text-lg" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>Pricing</span>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12 relative">
        {/* ── Hero ── */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="badge-cyan inline-block mb-4">Simple Pricing</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
            Choose Your{" "}
            <span style={{ background: "linear-gradient(135deg, #00e5ff, #22ef7e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Learning Plan
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#bac9cc" }}>
            Unlock premium lectures, unlimited mock tests, AI doubt solving, and the full digital library.
          </p>
          {isPremium && currentPlan && (
            <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)", color: "#00e5ff" }}>
              <Sparkles className="h-3.5 w-3.5" />
              Current: {currentPlan.name} {isTrialing && "(Trial)"}
            </div>
          )}
        </div>

        {/* ── Plans grid ── */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-14">
          {plans.map((plan, idx) => {
            const isCurrent = currentPlan?.id === plan.id;
            const cfg = planConfig[plan.slug] || planConfig.free;
            const PlanIcon = cfg.icon;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col animate-fade-up ${cfg.featured ? "glass-card-featured lg:-mt-4 lg:mb-4" : "glass-card"}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Featured badge */}
                {cfg.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ background: "linear-gradient(135deg, #22ef7e, #00e5ff)", color: "#041329", boxShadow: "0 4px 16px rgba(34,239,126,0.35)" }}
                    >
                      <Crown className="h-3 w-3" /> Most Popular
                    </div>
                  </div>
                )}

                {/* Accent top strip */}
                <div className="h-1 rounded-t-[0.875rem]" style={{ background: `linear-gradient(to right, ${cfg.accent}, ${cfg.accent}40, transparent)` }} />

                {/* Gradient background */}
                <div className="absolute inset-0 rounded-[0.875rem] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{ background: cfg.gradient }} />

                <div className="p-6 flex flex-col flex-1 relative">
                  {/* Plan icon & name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${cfg.accent}15`, border: `1px solid ${cfg.accent}30`, boxShadow: `0 0 16px ${cfg.glow}` }}>
                      <PlanIcon className="h-5 w-5" style={{ color: cfg.accent }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{plan.name}</h3>
                      <p className="text-xs" style={{ color: "#849396" }}>
                        {plan.slug === "free"     && "Get started for free"}
                        {plan.slug === "monthly"  && "Flexible billing"}
                        {plan.slug === "yearly"   && "Best value"}
                        {plan.slug === "lifetime" && "One-time payment"}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.slug === "lifetime" ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: cfg.accent }}>₹{plan.price_total}</span>
                        <span className="text-sm" style={{ color: "#849396" }}>one-time</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: cfg.accent }}>
                          {plan.slug === "free" ? "Free" : `₹${plan.price_monthly}`}
                        </span>
                        {plan.slug !== "free" && <span className="text-sm" style={{ color: "#849396" }}>/mo</span>}
                      </div>
                    )}
                    {plan.slug === "yearly" && (
                      <p className="text-xs mt-1" style={{ color: "#849396" }}>₹{plan.price_total} billed yearly</p>
                    )}
                    {plan.trial_days > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: `${cfg.accent}12`, border: `1px solid ${cfg.accent}25`, color: cfg.accent }}>
                        <Sparkles className="h-3 w-3" /> {plan.trial_days}-day free trial
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="divider-subtle mb-5" />

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${cfg.accent}15`, border: `1px solid ${cfg.accent}25` }}>
                          <Check className="h-3 w-3" style={{ color: cfg.accent }} />
                        </div>
                        <span style={{ color: "#bac9cc" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="space-y-2">
                      <div
                        className="w-full py-3 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: `${cfg.accent}15`, border: `1px solid ${cfg.accent}30`, color: cfg.accent }}
                      >
                        ✓ Current Plan
                      </div>
                      {plan.slug !== "free" && (
                        <button
                          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                          style={{ background: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.2)", color: "#ffb4ab" }}
                          onClick={handleCancel}
                        >
                          Cancel Plan
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className={plan.slug === "free" ? "w-full py-3 rounded-xl text-sm font-semibold cursor-default" : "btn-primary w-full py-3 font-bold text-sm"}
                      style={plan.slug === "free"
                        ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#849396", borderRadius: "0.75rem" }
                        : cfg.featured
                          ? { background: "linear-gradient(135deg, #22ef7e, #00e5ff)", color: "#041329", borderRadius: "0.75rem", boxShadow: "0 4px 20px rgba(34,239,126,0.3)" }
                          : { borderRadius: "0.75rem" }
                      }
                      onClick={() => plan.slug !== "free" && handleSelectPlan(plan.id)}
                      disabled={plan.slug === "free"}
                    >
                      {plan.slug === "free" ? "Free Forever" : user ? `Get ${plan.name}` : "Sign up to start"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Referral & Coupon ── */}
        {user && (
          <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto animate-fade-up">
            {/* Referral */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,239,126,0.12)", border: "1px solid rgba(34,239,126,0.25)" }}>
                  <Gift className="h-5 w-5" style={{ color: "#22ef7e" }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>Refer & Earn</h3>
                  <p className="text-xs" style={{ color: "#849396" }}>7 free days per referral</p>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: "#bac9cc" }}>
                Share your referral code and earn 7 free days for each friend who subscribes!
              </p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 glass-input flex items-center font-mono text-sm" style={{ color: "#00e5ff" }}>
                  {referralCode}
                </div>
                <button
                  className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                  style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff" }}
                  onClick={copyReferral}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#849396" }}>
                <Users className="h-3.5 w-3.5" />
                <span>{referralCount} successful referral{referralCount !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(176,198,255,0.12)", border: "1px solid rgba(176,198,255,0.25)" }}>
                  <Tag className="h-5 w-5" style={{ color: "#b0c6ff" }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>Have a Coupon?</h3>
                  <p className="text-xs" style={{ color: "#849396" }}>Apply at checkout</p>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: "#bac9cc" }}>
                Apply coupon codes during checkout to get discounts on premium plans.
              </p>
              <div className="flex flex-wrap gap-2">
                {["WELCOME50", "STUDENT20", "FLAT100"].map((code) => (
                  <span key={code} className="px-3 py-1 rounded-lg font-mono text-xs font-bold"
                    style={{ background: "rgba(176,198,255,0.08)", border: "1px solid rgba(176,198,255,0.2)", color: "#b0c6ff" }}>
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Checkout Dialog ── */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: "rgba(12,24,48,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(32px)",
            boxShadow: "0 0 60px rgba(0,218,243,0.12)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              Checkout — {selectedPlanData?.name}
            </DialogTitle>
            <DialogDescription style={{ color: "#849396" }}>
              {selectedPlanData?.trial_days ? `Start with a ${selectedPlanData.trial_days}-day free trial.` : "Complete your subscription."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span style={{ color: "#bac9cc" }}>Plan price</span>
              <span className="font-semibold" style={{ color: "#d6e3ff" }}>₹{selectedPlanData?.price_total}</span>
            </div>

            <div className="flex gap-2">
              <input
                className="glass-input font-mono text-sm flex-1"
                placeholder="Coupon code"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
              />
              <button
                className="btn-glass px-4 text-sm"
                onClick={handleApplyCoupon}
                disabled={!couponCode}
              >
                Apply
              </button>
            </div>

            {couponResult && (
              <p className={`text-sm font-medium ${couponResult.valid ? "text-success" : "text-destructive"}`}
                style={{ color: couponResult.valid ? "#22ef7e" : "#ffb4ab" }}>
                {couponResult.message}
              </p>
            )}

            {couponResult?.valid && (
              <div className="flex justify-between items-center">
                <span style={{ color: "#bac9cc" }}>Discount</span>
                <span className="font-semibold" style={{ color: "#22ef7e" }}>
                  -₹{(selectedPlanData?.price_total || 0) - getDiscountedPrice()}
                </span>
              </div>
            )}

            <div className="divider-subtle" />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold" style={{ color: "#d6e3ff" }}>Total</span>
              <span className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#00e5ff" }}>
                ₹{getDiscountedPrice()}
              </span>
            </div>

            <p className="text-xs text-center" style={{ color: "#849396" }}>
              Powered by Razorpay. Secure payment processing.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <button
              className="btn-glass flex-1 py-2.5 text-sm"
              onClick={() => setCheckoutOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary flex-1 py-2.5 text-sm font-bold"
              style={{ borderRadius: "0.75rem" }}
              onClick={handleSubscribe}
              disabled={processing}
            >
              {processing ? "Processing..." : selectedPlanData?.trial_days ? "Start Free Trial" : "Subscribe Now"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
