import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, FileQuestion, BookOpen, TrendingUp } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444"];

const FacultyPerformance = () => {
  const { data: quizStats } = useQuery({
    queryKey: ["faculty-quiz-stats"],
    queryFn: async () => {
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score, total_marks, is_completed, quizzes(title)")
        .eq("is_completed", true);
      if (!attempts?.length) return { quizData: [], avgScore: 0, totalAttempts: 0 };

      const grouped: Record<string, { title: string; scores: number[] }> = {};
      attempts.forEach((a: any) => {
        const qid = a.quiz_id;
        if (!grouped[qid]) grouped[qid] = { title: a.quizzes?.title || "Quiz", scores: [] };
        if (a.total_marks) grouped[qid].scores.push((Number(a.score) / a.total_marks) * 100);
      });

      const quizData = Object.values(grouped).map((g) => ({
        name: g.title.length > 15 ? g.title.substring(0, 15) + "…" : g.title,
        avg: Math.round(g.scores.reduce((s, v) => s + v, 0) / g.scores.length),
        attempts: g.scores.length,
      }));

      const allScores = attempts.filter((a: any) => a.total_marks).map((a: any) => (Number(a.score) / a.total_marks) * 100);
      const avgScore = allScores.length ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;

      return { quizData, avgScore, totalAttempts: attempts.length };
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["faculty-counts"],
    queryFn: async () => {
      const [{ count: lectures }, { count: quizzes }, { count: assignments }] = await Promise.all([
        supabase.from("lectures").select("*", { count: "exact", head: true }),
        supabase.from("quizzes").select("*", { count: "exact", head: true }),
        supabase.from("assignments").select("*", { count: "exact", head: true }),
      ]);
      return { lectures: lectures || 0, quizzes: quizzes || 0, assignments: assignments || 0 };
    },
  });

  const gradeDistribution = [
    { name: "90-100%", value: 0 },
    { name: "70-89%", value: 0 },
    { name: "50-69%", value: 0 },
    { name: "30-49%", value: 0 },
    { name: "<30%", value: 0 },
  ];

  // Build grade distribution from quiz data
  if (quizStats?.quizData) {
    quizStats.quizData.forEach((q) => {
      if (q.avg >= 90) gradeDistribution[0].value++;
      else if (q.avg >= 70) gradeDistribution[1].value++;
      else if (q.avg >= 50) gradeDistribution[2].value++;
      else if (q.avg >= 30) gradeDistribution[3].value++;
      else gradeDistribution[4].value++;
    });
  }

  const stats = [
    { label: "Lectures", value: counts?.lectures || 0, icon: BookOpen },
    { label: "Quizzes", value: counts?.quizzes || 0, icon: FileQuestion },
    { label: "Total Attempts", value: quizStats?.totalAttempts || 0, icon: Users },
    { label: "Avg Score", value: `${quizStats?.avgScore || 0}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Performance Analytics</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-3 bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Quiz Average Scores</CardTitle></CardHeader>
          <CardContent>
            {quizStats?.quizData?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quizStats.quizData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No quiz data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            {gradeDistribution.some((g) => g.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {gradeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No grade data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyPerformance;
