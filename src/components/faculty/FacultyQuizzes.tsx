import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, FileQuestion, Trash2, PlusCircle } from "lucide-react";

const FacultyQuizzes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", duration_minutes: 30, quiz_type: "unit_quiz",
    negative_marking: false, negative_mark_value: 0.25, subject_id: "",
  });
  const [qForm, setQForm] = useState({
    question_text: "", correct_answer: "", explanation: "", marks: 1,
    question_type: "mcq", options: ["", "", "", ""],
  });
  const [gradingQuizId, setGradingQuizId] = useState("");

  const { data: subjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name, code").order("name");
      return data || [];
    },
  });

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["faculty-quizzes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*, subjects(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["quiz-questions", selectedQuizId],
    enabled: !!selectedQuizId,
    queryFn: async () => {
      const { data } = await supabase.from("questions").select("*").eq("quiz_id", selectedQuizId).order("sort_order");
      return data || [];
    },
  });

  const createQuiz = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quizzes").insert({
        title: form.title,
        description: form.description,
        duration_minutes: form.duration_minutes,
        quiz_type: form.quiz_type,
        negative_marking: form.negative_marking,
        negative_mark_value: form.negative_mark_value,
        subject_id: form.subject_id || null,
        created_by: user?.id,
        is_published: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Quiz created!");
      queryClient.invalidateQueries({ queryKey: ["faculty-quizzes"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addQuestion = useMutation({
    mutationFn: async () => {
      const count = questions?.length || 0;
      const { error } = await supabase.from("questions").insert({
        quiz_id: selectedQuizId,
        question_text: qForm.question_text,
        correct_answer: qForm.correct_answer,
        explanation: qForm.explanation || null,
        marks: qForm.marks,
        options: qForm.options.filter(Boolean),
        sort_order: count + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Question added!");
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", selectedQuizId] });
      setQForm({ question_text: "", correct_answer: "", explanation: "", marks: 1, options: ["", "", "", ""] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("quizzes").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-quizzes"] }),
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Quiz deleted");
      queryClient.invalidateQueries({ queryKey: ["faculty-quizzes"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Manage Tests & Quizzes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Quiz</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Quiz</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Subject</Label>
                <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} /></div>
                <div><Label>Type</Label>
                    <Select value={form.quiz_type} onValueChange={(v) => setForm({ ...form, quiz_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit_quiz">Unit Quiz</SelectItem>
                        <SelectItem value="semester_exam">Semester Exam</SelectItem>
                        <SelectItem value="mock_exam">Mock Exam</SelectItem>
                        <SelectItem value="practice">Practice</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.negative_marking} onCheckedChange={(v) => setForm({ ...form, negative_marking: v })} />
                <Label>Negative marking</Label>
              </div>
              <Button onClick={() => createQuiz.mutate()} disabled={!form.title || createQuiz.isPending} className="w-full">
                {createQuiz.isPending ? "Creating..." : "Create Quiz"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !quizzes?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No quizzes yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q: any) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.subjects?.name} · {q.duration_minutes}min · {q.quiz_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={questionOpen && selectedQuizId === q.id} onOpenChange={(v) => { setQuestionOpen(v); if (v) setSelectedQuizId(q.id); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1"><PlusCircle className="h-3 w-3" /> Questions</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Manage Questions — {q.title}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          {questions?.map((qu: any, i: number) => (
                            <Card key={qu.id}><CardContent className="p-3">
                              <p className="text-sm font-medium">Q{i + 1}. {qu.question_text}</p>
                              <p className="text-xs text-muted-foreground mt-1">Answer: {qu.correct_answer} · {qu.marks} marks</p>
                            </CardContent></Card>
                          ))}
                          <hr />
                          <h4 className="font-semibold text-sm">Add Question</h4>
                          <div><Label>Question</Label><Textarea value={qForm.question_text} onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })} /></div>
                          {qForm.options.map((opt, i) => (
                            <div key={i}><Label>Option {String.fromCharCode(65 + i)}</Label>
                              <Input value={opt} onChange={(e) => { const o = [...qForm.options]; o[i] = e.target.value; setQForm({ ...qForm, options: o }); }} />
                            </div>
                          ))}
                          <div><Label>Correct Answer</Label><Input value={qForm.correct_answer} onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })} placeholder="e.g. A" /></div>
                          <div><Label>Explanation</Label><Textarea value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} /></div>
                          <div><Label>Marks</Label><Input type="number" value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: +e.target.value })} /></div>
                          <Button onClick={() => addQuestion.mutate()} disabled={!qForm.question_text || !qForm.correct_answer || addQuestion.isPending} className="w-full">
                            {addQuestion.isPending ? "Adding..." : "Add Question"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Switch checked={q.is_published} onCheckedChange={(v) => togglePublish.mutate({ id: q.id, is_published: v })} />
                    <Badge variant={q.is_published ? "default" : "secondary"}>{q.is_published ? "Live" : "Draft"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteQuiz.mutate(q.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyQuizzes;
