import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Video, FileText, Trash2 } from "lucide-react";

const FacultyLectures = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [form, setForm] = useState({ title: "", video_url: "", pdf_url: "", type: "video", is_free: false });

  const { data: subjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name, code").order("name");
      return data || [];
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics-for-subject", selectedSubject],
    enabled: !!selectedSubject,
    queryFn: async () => {
      const { data: units } = await supabase.from("units").select("id").eq("subject_id", selectedSubject);
      if (!units?.length) return [];
      const unitIds = units.map((u) => u.id);
      const { data } = await supabase.from("topics").select("id, title, unit_id").in("unit_id", unitIds).order("topic_number");
      return data || [];
    },
  });

  const { data: lectures, isLoading } = useQuery({
    queryKey: ["faculty-lectures"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lectures")
        .select("*, topics(title, unit_id, units(title, subject_id, subjects(name)))")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lectures").insert({
        title: form.title,
        video_url: form.video_url || null,
        pdf_url: form.pdf_url || null,
        type: form.type,
        is_free: form.is_free,
        topic_id: selectedTopic,
        created_by: user?.id,
        is_published: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lecture created!");
      queryClient.invalidateQueries({ queryKey: ["faculty-lectures"] });
      setOpen(false);
      setForm({ title: "", video_url: "", pdf_url: "", type: "video", is_free: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("lectures").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-lectures"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lectures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lecture deleted");
      queryClient.invalidateQueries({ queryKey: ["faculty-lectures"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Manage Lectures</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Lecture</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Lecture</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setSelectedTopic(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject}>
                  <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                  <SelectContent>
                    {topics?.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lecture title" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF / Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === "video" && (
                <div>
                  <Label>Video URL</Label>
                  <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/..." />
                </div>
              )}
              <div>
                <Label>PDF / Notes URL</Label>
                <Input value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: v })} />
                <Label>Free content</Label>
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || !selectedTopic || createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Creating..." : "Create Lecture"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !lectures?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No lectures yet. Click "Add Lecture" to create one.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {lectures.map((l: any) => (
            <Card key={l.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {l.type === "video" ? <Video className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                  <div>
                    <p className="font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.topics?.units?.subjects?.name} → {l.topics?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {l.is_free && <Badge variant="secondary">Free</Badge>}
                  <Switch
                    checked={l.is_published}
                    onCheckedChange={(v) => togglePublish.mutate({ id: l.id, is_published: v })}
                  />
                  <span className="text-xs text-muted-foreground">{l.is_published ? "Published" : "Draft"}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(l.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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

export default FacultyLectures;
