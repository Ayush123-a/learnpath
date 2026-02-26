import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ParentPerformance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
      if (links && links.length > 0) {
        const ids = links.map((l) => l.student_id);
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
        setStudents(profiles || []);
        if (profiles && profiles.length > 0) setSelectedStudent(profiles[0].user_id);
      }
      const { data: q } = await supabase.from("quizzes").select("*");
      setQuizzes(q || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  useEffect(() => {
    if (!selectedStudent) return;
    const fetchAttempts = async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", selectedStudent)
        .eq("is_completed", true)
        .order("completed_at", { ascending: false });
      setAttempts(data || []);
    };
    fetchAttempts();
  }, [selectedStudent]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (students.length === 0) {
    return (
      <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No students linked to your account.</p></CardContent></Card>
    );
  }

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
    : 0;

  const chartData = attempts.slice(0, 10).reverse().map((a, i) => {
    const quiz = quizzes.find((q) => q.id === a.quiz_id);
    return {
      name: quiz?.title?.slice(0, 15) || `Quiz ${i + 1}`,
      score: a.score || 0,
      total: a.total_marks || 0,
    };
  });

  return (
    <div className="space-y-6">
      {students.length > 1 && (
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select student" /></SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.user_id} value={s.user_id}>{s.full_name || s.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-primary">{attempts.length}</p><p className="text-sm text-muted-foreground">Tests Taken</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-3xl font-bold">{avgScore}</p><p className="text-sm text-muted-foreground">Average Score</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold">{attempts.length > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : 0}</p>
          <p className="text-sm text-muted-foreground">Best Score</p>
        </CardContent></Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Quiz Scores</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" name="Score" />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Quiz Results</CardTitle></CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No quiz attempts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((a) => {
                  const quiz = quizzes.find((q) => q.id === a.quiz_id);
                  const pct = a.total_marks ? Math.round((a.score / a.total_marks) * 100) : 0;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{quiz?.title || "—"}</TableCell>
                      <TableCell>{a.score}</TableCell>
                      <TableCell>{a.total_marks}</TableCell>
                      <TableCell>
                        <Badge variant={pct >= 60 ? "default" : "destructive"}>{pct}%</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentPerformance;
