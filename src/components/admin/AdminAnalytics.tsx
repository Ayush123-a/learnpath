import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, BookOpen, GraduationCap, FileQuestion, BarChart3 } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ users: 0, degrees: 0, subjects: 0, books: 0, quizzes: 0, lectures: 0, attempts: 0 });
  const [roleDistribution, setRoleDistribution] = useState<{ name: string; value: number }[]>([]);
  const [degreeStats, setDegreeStats] = useState<{ name: string; subjects: number; books: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, degrees, subjects, books, quizzes, lectures, attempts, roles] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("degrees").select("*"),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("lectures").select("id", { count: "exact", head: true }),
        supabase.from("quiz_attempts").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
      ]);

      setStats({
        users: profiles.count || 0,
        degrees: degrees.data?.length || 0,
        subjects: subjects.count || 0,
        books: books.count || 0,
        quizzes: quizzes.count || 0,
        lectures: lectures.count || 0,
        attempts: attempts.count || 0,
      });

      // Role distribution
      const roleCounts: Record<string, number> = {};
      (roles.data || []).forEach((r) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      setRoleDistribution(Object.entries(roleCounts).map(([name, value]) => ({ name, value })));

      // Degree stats
      const degs = degrees.data || [];
      const { data: allBooks } = await supabase.from("books").select("degree_id");
      const { data: allYears } = await supabase.from("years").select("*");
      const { data: allSems } = await supabase.from("semesters").select("*");
      const { data: allSubs } = await supabase.from("subjects").select("semester_id");

      const ds = degs.map((d) => {
        const dYears = (allYears || []).filter((y) => y.degree_id === d.id);
        const dSems = (allSems || []).filter((s) => dYears.some((y) => y.id === s.year_id));
        const subCount = (allSubs || []).filter((sub) => dSems.some((s) => s.id === sub.semester_id)).length;
        const bookCount = (allBooks || []).filter((b) => b.degree_id === d.id).length;
        return { name: d.code, subjects: subCount, books: bookCount };
      });
      setDegreeStats(ds);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Degrees", value: stats.degrees, icon: GraduationCap },
    { label: "Subjects", value: stats.subjects, icon: BookOpen },
    { label: "Books", value: stats.books, icon: BookOpen },
    { label: "Quizzes", value: stats.quizzes, icon: FileQuestion },
    { label: "Lectures", value: stats.lectures, icon: BarChart3 },
    { label: "Quiz Attempts", value: stats.attempts, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg p-3 bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User Role Distribution</CardTitle></CardHeader>
          <CardContent>
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {roleDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Content per Degree</CardTitle></CardHeader>
          <CardContent>
            {degreeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={degreeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subjects" fill="hsl(var(--primary))" name="Subjects" />
                  <Bar dataKey="books" fill="hsl(var(--chart-2))" name="Books" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
