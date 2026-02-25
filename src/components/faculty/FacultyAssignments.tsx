import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, FileText, Trash2, CheckCircle } from "lucide-react";

const FacultyAssignments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [form, setForm] = useState({ title: "", description: "", max_marks: 100, due_date: "", subject_id: "" });
  const [gradeForm, setGradeForm] = useState<Record<string, { grade: string; feedback: string }>>({});

  const { data: subjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name, code").order("name");
      return data || [];
    },
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["faculty-assignments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assignments")
        .select("*, subjects(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: submissions } = useQuery({
    queryKey: ["submissions", selectedAssignment],
    enabled: !!selectedAssignment,
    queryFn: async () => {
      const { data } = await supabase
        .from("assignment_submissions")
        .select("*, profiles:user_id(full_name, email)")
        .eq("assignment_id", selectedAssignment)
        .order("submitted_at", { ascending: false });
      return data || [];
    },
  });

  const createAssignment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assignments").insert({
        title: form.title,
        description: form.description || null,
        max_marks: form.max_marks,
        due_date: form.due_date || null,
        subject_id: form.subject_id,
        created_by: user!.id,
        is_published: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assignment created!");
      queryClient.invalidateQueries({ queryKey: ["faculty-assignments"] });
      setOpen(false);
      setForm({ title: "", description: "", max_marks: 100, due_date: "", subject_id: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const gradeSubmission = useMutation({
    mutationFn: async ({ id, grade, feedback }: { id: string; grade: number; feedback: string }) => {
      const { error } = await supabase.from("assignment_submissions").update({
        grade,
        feedback,
        graded_by: user!.id,
        graded_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Graded!");
      queryClient.invalidateQueries({ queryKey: ["submissions", selectedAssignment] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["faculty-assignments"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Assignments & Grading</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Subject</Label>
                <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Max Marks</Label><Input type="number" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: +e.target.value })} /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <Button onClick={() => createAssignment.mutate()} disabled={!form.title || !form.subject_id || createAssignment.isPending} className="w-full">
                {createAssignment.isPending ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !assignments?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No assignments yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subjects?.name} · Max: {a.max_marks} marks{a.due_date ? ` · Due: ${new Date(a.due_date).toLocaleDateString()}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={gradeOpen && selectedAssignment === a.id} onOpenChange={(v) => { setGradeOpen(v); if (v) setSelectedAssignment(a.id); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1"><CheckCircle className="h-3 w-3" /> Grade</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Submissions — {a.title}</DialogTitle></DialogHeader>
                      {!submissions?.length ? (
                        <p className="text-muted-foreground text-sm py-4">No submissions yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {submissions.map((s: any) => (
                            <Card key={s.id}>
                              <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">{s.profiles?.full_name || s.profiles?.email || "Student"}</p>
                                  {s.grade != null ? (
                                    <Badge>Graded: {s.grade}/{a.max_marks}</Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending</Badge>
                                  )}
                                </div>
                                {s.content && <p className="text-xs text-muted-foreground">{s.content.substring(0, 200)}</p>}
                                {s.grade == null && (
                                  <div className="flex gap-2 mt-2">
                                    <Input
                                      type="number"
                                      placeholder="Grade"
                                      className="w-24"
                                      value={gradeForm[s.id]?.grade || ""}
                                      onChange={(e) => setGradeForm({ ...gradeForm, [s.id]: { ...gradeForm[s.id], grade: e.target.value } })}
                                    />
                                    <Input
                                      placeholder="Feedback"
                                      className="flex-1"
                                      value={gradeForm[s.id]?.feedback || ""}
                                      onChange={(e) => setGradeForm({ ...gradeForm, [s.id]: { ...gradeForm[s.id], feedback: e.target.value } })}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => gradeSubmission.mutate({ id: s.id, grade: +gradeForm[s.id]?.grade, feedback: gradeForm[s.id]?.feedback || "" })}
                                      disabled={!gradeForm[s.id]?.grade}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => deleteAssignment.mutate(a.id)}>
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

export default FacultyAssignments;
