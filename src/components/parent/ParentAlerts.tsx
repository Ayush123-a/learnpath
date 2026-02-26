import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";

const ParentAlerts = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [alerts, setAlerts] = useState<{ type: string; message: string; severity: "warning" | "danger" | "info" }[]>([]);
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
      setLoading(false);
    };
    fetch();
  }, [user]);

  useEffect(() => {
    if (!selectedStudent) return;
    const analyze = async () => {
      const newAlerts: typeof alerts = [];

      // Check attendance
      const { data: attendance } = await supabase
        .from("attendance")
        .select("*, subjects:subject_id(name)")
        .eq("student_id", selectedStudent);

      if (attendance && attendance.length > 0) {
        const subjectMap: Record<string, { present: number; total: number; name: string }> = {};
        attendance.forEach((a: any) => {
          const sid = a.subject_id;
          if (!subjectMap[sid]) subjectMap[sid] = { present: 0, total: 0, name: (a.subjects as any)?.name || "Unknown" };
          subjectMap[sid].total++;
          if (a.status === "present") subjectMap[sid].present++;
        });

        Object.values(subjectMap).forEach((s) => {
          const pct = Math.round((s.present / s.total) * 100);
          if (pct < 75) {
            newAlerts.push({
              type: "Attendance",
              message: `${s.name}: ${pct}% attendance (below 75% minimum)`,
              severity: pct < 50 ? "danger" : "warning",
            });
          }
        });
      }

      // Check quiz performance
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes:quiz_id(title, subject_id)")
        .eq("user_id", selectedStudent)
        .eq("is_completed", true);

      if (attempts && attempts.length > 0) {
        const subjectScores: Record<string, { total: number; scored: number; name: string }> = {};
        attempts.forEach((a: any) => {
          const sid = (a.quizzes as any)?.subject_id;
          if (!sid) return;
          if (!subjectScores[sid]) subjectScores[sid] = { total: 0, scored: 0, name: "" };
          subjectScores[sid].total += a.total_marks || 0;
          subjectScores[sid].scored += a.score || 0;
        });

        // Get subject names
        const { data: subs } = await supabase.from("subjects").select("id, name");
        Object.entries(subjectScores).forEach(([sid, s]) => {
          const subName = (subs || []).find((sub) => sub.id === sid)?.name || "Unknown";
          const pct = s.total > 0 ? Math.round((s.scored / s.total) * 100) : 0;
          if (pct < 40) {
            newAlerts.push({
              type: "Weak Subject",
              message: `${subName}: Only ${pct}% average quiz score`,
              severity: "danger",
            });
          } else if (pct < 60) {
            newAlerts.push({
              type: "Needs Improvement",
              message: `${subName}: ${pct}% average quiz score`,
              severity: "warning",
            });
          }
        });
      }

      // Check study time
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", selectedStudent)
        .gte("session_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]);

      const weeklyMinutes = (sessions || []).reduce((sum, s) => sum + s.duration_minutes, 0);
      if (weeklyMinutes < 60) {
        newAlerts.push({
          type: "Low Study Time",
          message: `Only ${weeklyMinutes} minutes studied this week`,
          severity: "danger",
        });
      } else if (weeklyMinutes < 300) {
        newAlerts.push({
          type: "Study Time",
          message: `${Math.round(weeklyMinutes / 60)} hours studied this week (recommended: 5+ hours)`,
          severity: "warning",
        });
      }

      if (newAlerts.length === 0) {
        newAlerts.push({ type: "All Good", message: "No alerts at this time. Your child is doing well!", severity: "info" });
      }

      setAlerts(newAlerts);
    };
    analyze();
  }, [selectedStudent]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (students.length === 0) {
    return (
      <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No students linked to your account.</p></CardContent></Card>
    );
  }

  const severityIcon = (severity: string) => {
    if (severity === "danger") return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (severity === "warning") return <TrendingDown className="h-5 w-5 text-amber-500" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

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

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <Card key={i} className={alert.severity === "danger" ? "border-destructive/30" : alert.severity === "warning" ? "border-amber-500/30" : ""}>
            <CardContent className="flex items-start gap-4 p-4">
              {severityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{alert.type}</span>
                  <Badge variant={alert.severity === "danger" ? "destructive" : alert.severity === "warning" ? "secondary" : "default"}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParentAlerts;
