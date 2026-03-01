import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Check, Sparkles, Gift, Copy, Users, Tag } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="ScholarsHub" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">Pricing</span>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Choose Your Learning Plan</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock premium lectures, unlimited mock tests, AI doubt solving, and the full digital library.
          </p>
          {isPremium && currentPlan && (
            <Badge className="mt-4 text-sm px-4 py-1 gap-2" variant="default">
              <Sparkles className="h-3.5 w-3.5" />
              Current: {currentPlan.name} {isTrialing && "(Trial)"}
            </Badge>
          )}
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-12">
          {plans.map(plan => {
            const isCurrent = currentPlan?.id === plan.id;
            const isPopular = plan.slug === "yearly";
            return (
              <Card key={plan.id} className={`relative flex flex-col ${isPopular ? "border-primary shadow-lg scale-105" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.slug === "free" ? "Get started for free" :
                      plan.slug === "monthly" ? "Flexible monthly billing" : "Best value for serious learners"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">₹{plan.price_monthly}</span>
                    <span className="text-muted-foreground">/mo</span>
                    {plan.slug === "yearly" && (
                      <p className="text-sm text-muted-foreground mt-1">₹{plan.price_total} billed yearly</p>
                    )}
                    {plan.trial_days > 0 && (
                      <Badge variant="secondary" className="mt-2">{plan.trial_days}-day free trial</Badge>
                    )}
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <div className="w-full space-y-2">
                      <Button className="w-full" variant="secondary" disabled>Current Plan</Button>
                      {plan.slug !== "free" && (
                        <Button className="w-full" variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.slug === "free" ? "outline" : "default"}
                      onClick={() => plan.slug !== "free" && handleSelectPlan(plan.id)}
                      disabled={plan.slug === "free"}
                    >
                      {plan.slug === "free" ? "Free Forever" : user ? "Subscribe" : "Sign up to start"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Referral & Coupon Section */}
        {user && (
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Gift className="h-5 w-5 text-primary" /> Refer & Earn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Share your referral code and earn 7 free days for each friend who subscribes!</p>
                <div className="flex gap-2">
                  <Input value={referralCode} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={copyReferral}><Copy className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {referralCount} successful referral{referralCount !== 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Tag className="h-5 w-5 text-primary" /> Have a Coupon?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Apply coupon codes during checkout to get discounts on premium plans.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono">WELCOME50</Badge>
                  <Badge variant="outline" className="font-mono">STUDENT20</Badge>
                  <Badge variant="outline" className="font-mono">FLAT100</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout — {selectedPlanData?.name}</DialogTitle>
            <DialogDescription>
              {selectedPlanData?.trial_days ? `Start with a ${selectedPlanData.trial_days}-day free trial.` : "Complete your subscription."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan price</span>
              <span className="font-semibold">₹{selectedPlanData?.price_total}</span>
            </div>

            <div className="flex gap-2">
              <Input placeholder="Coupon code" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }} className="font-mono" />
              <Button variant="outline" onClick={handleApplyCoupon} disabled={!couponCode}>Apply</Button>
            </div>

            {couponResult && (
              <p className={`text-sm ${couponResult.valid ? "text-primary" : "text-destructive"}`}>{couponResult.message}</p>
            )}

            {couponResult?.valid && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-primary font-semibold">
                  -₹{(selectedPlanData?.price_total || 0) - getDiscountedPrice()}
                </span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">₹{getDiscountedPrice()}</span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              This is a mock checkout. No real payment will be processed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={handleSubscribe} disabled={processing}>
              {processing ? "Processing..." : selectedPlanData?.trial_days ? "Start Free Trial" : "Subscribe Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
