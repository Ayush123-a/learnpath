import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";

const ParentStudyTime = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
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
      const { data: subs } = await supabase.from("subjects").select("*");
      setSubjects(subs || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  useEffect(() => {
    if (!selectedStudent) return;
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", selectedStudent)
        .order("session_date", { ascending: false })
        .limit(100);
      setSessions(data || []);
    };
    fetchSessions();
  }, [selectedStudent]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (students.length === 0) {
    return (
      <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No students linked to your account.</p></CardContent></Card>
    );
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  // Daily study time (last 7 days)
  const last7Days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    last7Days[key] = 0;
  }
  sessions.forEach((s) => {
    if (last7Days[s.session_date] !== undefined) {
      last7Days[s.session_date] += s.duration_minutes;
    }
  });
  const dailyChart = Object.entries(last7Days).map(([date, mins]) => ({
    day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
    hours: Math.round(mins / 60 * 10) / 10,
  }));

  // Per subject
  const subjectTime: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.subject_id) {
      subjectTime[s.subject_id] = (subjectTime[s.subject_id] || 0) + s.duration_minutes;
    }
  });
  const subjectChart = Object.entries(subjectTime)
    .map(([id, mins]) => ({
      name: subjects.find((s) => s.id === id)?.name?.slice(0, 15) || "Other",
      hours: Math.round(mins / 60 * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours);

  const avgPerDay = sessions.length > 0
    ? Math.round(totalMinutes / Math.max(1, Object.keys(last7Days).filter((k) => last7Days[k] > 0).length))
    : 0;

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
        <Card><CardContent className="p-6 text-center">
          <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-3xl font-bold">{totalHours}h</p>
          <p className="text-sm text-muted-foreground">Total Study Time</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold">{sessions.length}</p>
          <p className="text-sm text-muted-foreground">Study Sessions</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <p className="text-3xl font-bold">{avgPerDay}m</p>
          <p className="text-sm text-muted-foreground">Avg per Active Day</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Daily Study Time (Last 7 Days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="hours" fill="hsl(var(--primary))" name="Hours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {subjectChart.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Time per Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: "Hours", position: "bottom" }} />
                <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(var(--chart-2))" name="Hours" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentStudyTime;
