import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Tag, Percent } from "lucide-react";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCoupon, setShowCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_type: "percentage", discount_value: 0, max_uses: 100, applicable_plan_slugs: "monthly,yearly" });

  const fetchAll = async () => {
    setLoading(true);
    const [subs, p, prof, c] = await Promise.all([
      supabase.from("user_subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("subscription_plans").select("*").order("sort_order"),
      supabase.from("profiles").select("user_id, full_name, email"),
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    ]);
    setSubscriptions(subs.data || []);
    setPlans(p.data || []);
    setProfiles(prof.data || []);
    setCoupons(c.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const getPlanName = (planId: string) => plans.find(p => p.id === planId)?.name || "—";
  const getUserName = (userId: string) => {
    const p = profiles.find(pr => pr.user_id === userId);
    return p ? (p.full_name || p.email) : userId.slice(0, 8);
  };

  const cancelSub = async (id: string) => {
    await supabase.from("user_subscriptions").update({ status: "cancelled" }).eq("id", id);
    toast.success("Subscription cancelled");
    fetchAll();
  };

  const addCoupon = async () => {
    if (!newCoupon.code) return toast.error("Code is required");
    const { error } = await supabase.from("coupons").insert({
      code: newCoupon.code.toUpperCase(),
      discount_type: newCoupon.discount_type,
      discount_value: newCoupon.discount_value,
      max_uses: newCoupon.max_uses || null,
      applicable_plan_slugs: newCoupon.applicable_plan_slugs.split(",").map(s => s.trim()).filter(Boolean),
      valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success("Coupon created");
    setShowCoupon(false);
    setNewCoupon({ code: "", discount_type: "percentage", discount_value: 0, max_uses: 100, applicable_plan_slugs: "monthly,yearly" });
    fetchAll();
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: !active }).eq("id", id);
    fetchAll();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon deleted");
    fetchAll();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const activeSubs = subscriptions.filter(s => s.status === "active" || s.status === "trial");
  const totalRevenue = subscriptions.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold text-primary">{activeSubs.length}</p>
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold">₹{totalRevenue}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold">{subscriptions.filter(s => s.status === "trial").length}</p>
          <p className="text-sm text-muted-foreground">Active Trials</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold">{coupons.filter(c => c.is_active).length}</p>
          <p className="text-sm text-muted-foreground">Active Coupons</p>
        </CardContent></Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> All Subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{getUserName(s.user_id)}</TableCell>
                      <TableCell>{getPlanName(s.plan_id)}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : s.status === "trial" ? "secondary" : "destructive"}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{s.amount_paid}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {(s.status === "active" || s.status === "trial") && (
                          <Button size="sm" variant="destructive" onClick={() => cancelSub(s.id)}>Cancel</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupons Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Coupon Codes ({coupons.length})</CardTitle>
          <Dialog open={showCoupon} onOpenChange={setShowCoupon}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Coupon</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Code</Label><Input value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} placeholder="SUMMER30" className="font-mono" /></div>
                <div><Label>Discount Type</Label>
                  <Select value={newCoupon.discount_type} onValueChange={v => setNewCoupon({ ...newCoupon, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Discount Value</Label><Input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })} /></div>
                <div><Label>Max Uses</Label><Input type="number" value={newCoupon.max_uses} onChange={e => setNewCoupon({ ...newCoupon, max_uses: Number(e.target.value) })} /></div>
                <div><Label>Applicable Plans (comma-separated)</Label><Input value={newCoupon.applicable_plan_slugs} onChange={e => setNewCoupon({ ...newCoupon, applicable_plan_slugs: e.target.value })} placeholder="monthly,yearly" /></div>
              </div>
              <DialogFooter><Button onClick={addCoupon}>Create Coupon</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Plans</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">{c.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Percent className="h-3 w-3" />
                        {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.current_uses}/{c.max_uses || "∞"}</TableCell>
                    <TableCell className="text-sm">{c.applicable_plan_slugs?.join(", ") || "All"}</TableCell>
                    <TableCell>
                      <Switch checked={c.is_active} onCheckedChange={() => toggleCoupon(c.id, c.is_active)} />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => deleteCoupon(c.id)}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
