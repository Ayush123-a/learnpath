import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts";
import { Users, BookOpen, GraduationCap, FileQuestion, BarChart3, CreditCard, TrendingUp } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ users: 0, degrees: 0, subjects: 0, books: 0, quizzes: 0, lectures: 0, attempts: 0, activeSubs: 0, totalRevenue: 0 });
  const [roleDistribution, setRoleDistribution] = useState<{ name: string; value: number }[]>([]);
  const [degreeStats, setDegreeStats] = useState<{ name: string; subjects: number; books: number }[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<{ name: string; revenue: number; count: number }[]>([]);
  const [subsByMonth, setSubsByMonth] = useState<{ month: string; count: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, degrees, subjects, books, quizzes, lectures, attempts, roles, subs, plans] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("degrees").select("*"),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("lectures").select("id", { count: "exact", head: true }),
        supabase.from("quiz_attempts").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("user_subscriptions").select("*"),
        supabase.from("subscription_plans").select("*"),
      ]);

      const allSubs = subs.data || [];
      const allPlans = plans.data || [];
      const activeSubs = allSubs.filter(s => s.status === "active" || s.status === "trial");
      const totalRevenue = allSubs.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0);

      setStats({
        users: profiles.count || 0,
        degrees: degrees.data?.length || 0,
        subjects: subjects.count || 0,
        books: books.count || 0,
        quizzes: quizzes.count || 0,
        lectures: lectures.count || 0,
        attempts: attempts.count || 0,
        activeSubs: activeSubs.length,
        totalRevenue,
      });

      // Role distribution
      const roleCounts: Record<string, number> = {};
      (roles.data || []).forEach(r => { roleCounts[r.role] = (roleCounts[r.role] || 0) + 1; });
      setRoleDistribution(Object.entries(roleCounts).map(([name, value]) => ({ name, value })));

      // Degree stats
      const degs = degrees.data || [];
      const [allBooks, allYears, allSems, allSubjects] = await Promise.all([
        supabase.from("books").select("degree_id"),
        supabase.from("years").select("*"),
        supabase.from("semesters").select("*"),
        supabase.from("subjects").select("semester_id"),
      ]);
      setDegreeStats(degs.map(d => {
        const dYears = (allYears.data || []).filter(y => y.degree_id === d.id);
        const dSems = (allSems.data || []).filter(s => dYears.some(y => y.id === s.year_id));
        return {
          name: d.code,
          subjects: (allSubjects.data || []).filter(sub => dSems.some(s => s.id === sub.semester_id)).length,
          books: (allBooks.data || []).filter(b => b.degree_id === d.id).length,
        };
      }));

      // Revenue by plan
      const planRevenue: Record<string, { revenue: number; count: number }> = {};
      allSubs.forEach(s => {
        const plan = allPlans.find(p => p.id === s.plan_id);
        const name = plan?.name || "Unknown";
        if (!planRevenue[name]) planRevenue[name] = { revenue: 0, count: 0 };
        planRevenue[name].revenue += Number(s.amount_paid || 0);
        planRevenue[name].count += 1;
      });
      setRevenueByPlan(Object.entries(planRevenue).map(([name, data]) => ({ name, ...data })));

      // Subscriptions by month (last 6 months)
      const monthData: Record<string, { count: number; revenue: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toISOString().slice(0, 7);
        monthData[key] = { count: 0, revenue: 0 };
      }
      allSubs.forEach(s => {
        const key = s.created_at.slice(0, 7);
        if (monthData[key]) {
          monthData[key].count += 1;
          monthData[key].revenue += Number(s.amount_paid || 0);
        }
      });
      setSubsByMonth(Object.entries(monthData).map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en", { month: "short" }),
        ...data,
      })));

      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Active Subs", value: stats.activeSubs, icon: CreditCard },
    { label: "Revenue", value: `₹${stats.totalRevenue}`, icon: TrendingUp },
    { label: "Degrees", value: stats.degrees, icon: GraduationCap },
    { label: "Subjects", value: stats.subjects, icon: BookOpen },
    { label: "Books", value: stats.books, icon: BookOpen },
    { label: "Quizzes", value: stats.quizzes, icon: FileQuestion },
    { label: "Quiz Attempts", value: stats.attempts, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
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
        {/* Revenue Trend */}
        <Card>
          <CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={subsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscriptions by Month */}
        <Card>
          <CardHeader><CardTitle>Monthly Subscriptions</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Subscriptions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader><CardTitle>User Role Distribution</CardTitle></CardHeader>
          <CardContent>
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card>
          <CardHeader><CardTitle>Revenue by Plan</CardTitle></CardHeader>
          <CardContent>
            {revenueByPlan.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByPlan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="count" fill="hsl(var(--chart-3))" name="Subscribers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>

        {/* Content per Degree */}
        <Card className="lg:col-span-2">
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
            ) : <p className="text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
