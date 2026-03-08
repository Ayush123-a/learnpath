import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, FileQuestion, BarChart3 } from "lucide-react";

const CollegeAdminAnalytics = () => {
  const { collegeId, collegeName } = useAuth();
  const [stats, setStats] = useState({ users: 0, degrees: 0, books: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;
    const fetch = async () => {
      setLoading(true);
      const [u, d, b, q] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("college_id", collegeId),
        supabase.from("degrees").select("id", { count: "exact", head: true }).eq("college_id", collegeId),
        supabase.from("books").select("id", { count: "exact", head: true }).eq("college_id", collegeId),
        supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("college_id", collegeId),
      ]);
      setStats({
        users: u.count || 0,
        degrees: d.count || 0,
        books: b.count || 0,
        quizzes: q.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, [collegeId]);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Degrees", value: stats.degrees, icon: GraduationCap, color: "text-success" },
    { label: "Books", value: stats.books, icon: BookOpen, color: "text-accent" },
    { label: "Quizzes", value: stats.quizzes, icon: FileQuestion, color: "text-info" },
  ];

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> {collegeName || "College"} Overview
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Quick stats for your institution</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-muted p-3 ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollegeAdminAnalytics;
