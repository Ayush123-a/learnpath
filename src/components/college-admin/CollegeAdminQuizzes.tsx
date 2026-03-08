import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileQuestion, Trash2 } from "lucide-react";

const CollegeAdminQuizzes = () => {
  const { collegeId } = useAuth();
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["college-admin-quizzes", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*, subjects(name)")
        .eq("college_id", collegeId!)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("quizzes").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["college-admin-quizzes"] });
      toast.success("Quiz updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["college-admin-quizzes"] });
      toast.success("Quiz deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const pending = quizzes.filter((q: any) => !q.is_published);
  const typeLabels: Record<string, string> = { unit_quiz: "Unit Quiz", mock_exam: "Mock Exam", semester_exam: "Semester Exam", practice: "Practice" };

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <FileQuestion className="h-5 w-5" /> Pending Review ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell><Badge variant="outline">{typeLabels[q.quiz_type] || q.quiz_type}</Badge></TableCell>
                    <TableCell>{(q as any).subjects?.name || "—"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => togglePublish.mutate({ id: q.id, is_published: true })}>Publish</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteQuiz.mutate(q.id)}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileQuestion className="h-5 w-5" /> All Quizzes ({quizzes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quizzes created for your college yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell><Badge variant="outline">{typeLabels[q.quiz_type] || q.quiz_type}</Badge></TableCell>
                    <TableCell>{(q as any).subjects?.name || "—"}</TableCell>
                    <TableCell>{q.total_marks}</TableCell>
                    <TableCell>
                      <Switch checked={q.is_published} onCheckedChange={(v) => togglePublish.mutate({ id: q.id, is_published: v })} />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => deleteQuiz.mutate(q.id)}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeAdminQuizzes;
