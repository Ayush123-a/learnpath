import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2, Trash2, Edit, Users, MapPin } from "lucide-react";

const AdminColleges = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    city: "",
    state: "",
  });

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["admin-colleges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Get user counts per college
  const { data: collegeCounts = {} } = useQuery({
    queryKey: ["college-user-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("college_id")
        .not("college_id", "is", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((p: any) => {
        counts[p.college_id] = (counts[p.college_id] || 0) + 1;
      });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      if (editId) {
        const { error } = await supabase.from("colleges").update(values).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("colleges").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-colleges"] });
      toast.success(editId ? "College updated!" : "College created!");
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("colleges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-colleges"] });
      toast.success("College deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("colleges").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-colleges"] });
      toast.success("Status updated!");
    },
  });

  const resetForm = () => {
    setForm({ name: "", code: "", description: "", address: "", city: "", state: "" });
    setEditId(null);
  };

  const openEdit = (college: any) => {
    setForm({
      name: college.name,
      code: college.code,
      description: college.description || "",
      address: college.address || "",
      city: college.city || "",
      state: college.state || "",
    });
    setEditId(college.id);
    setOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">Colleges</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Manage registered colleges on the platform</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add College
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-3 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit College" : "Add College"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>College Name</Label>
                <Input placeholder="e.g. City College of Engineering" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Code (unique identifier)</Label>
                <Input placeholder="e.g. CCE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="uppercase" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input placeholder="Full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button className="w-full" disabled={!form.name || !form.code || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
                {saveMutation.isPending ? "Saving..." : editId ? "Update College" : "Create College"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : colleges.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No colleges registered yet. Add your first college!
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Approval Section */}
          {colleges.filter((c: any) => !c.is_active).length > 0 && (
            <Card className="border-warning/30 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-warning flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Pending Approval ({colleges.filter((c: any) => !c.is_active).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {colleges.filter((c: any) => !c.is_active).map((college: any) => (
                  <div key={college.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{college.name}</span>
                        <Badge variant="outline" className="text-[10px]">{college.code}</Badge>
                      </div>
                      {college.city && <p className="text-xs text-muted-foreground mt-0.5">{college.city}, {college.state}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => toggleActiveMutation.mutate({ id: college.id, is_active: true })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => deleteMutation.mutate(college.id)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          {colleges.map((college: any) => (
            <Card key={college.id} className={`overflow-hidden ${!college.is_active ? "opacity-60" : ""}`}>
              <div className="h-1 bg-gradient-to-r from-primary to-info" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm md:text-base text-foreground">{college.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{college.code}</Badge>
                      <Badge variant={college.is_active ? "default" : "secondary"} className="text-[10px]">
                        {college.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {college.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{college.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] md:text-xs text-muted-foreground">
                      {college.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {college.city}, {college.state}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {collegeCounts[college.id] || 0} users
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => openEdit(college)}>
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => toggleActiveMutation.mutate({ id: college.id, is_active: !college.is_active })}
                  >
                    {college.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive ml-auto" onClick={() => deleteMutation.mutate(college.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminColleges;
