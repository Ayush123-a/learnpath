import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import logo from "@/assets/logo.png";

const AttendanceTracker = () => {
  const { user, loading } = useAuth();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["my-attendance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, subjects(name, code)")
        .eq("student_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Group by subject
  const bySubject: Record<string, { name: string; code: string; present: number; absent: number; total: number; records: typeof attendance }> = {};
  attendance.forEach((a: any) => {
    const sid = a.subject_id;
    if (!bySubject[sid]) {
      bySubject[sid] = {
        name: a.subjects?.name || "Unknown",
        code: a.subjects?.code || "",
        present: 0,
        absent: 0,
        total: 0,
        records: [],
      };
    }
    bySubject[sid].total++;
    if (a.status === "present") bySubject[sid].present++;
    else bySubject[sid].absent++;
    bySubject[sid].records.push(a);
  });

  const subjects = Object.entries(bySubject);
  const totalPresent = attendance.filter((a: any) => a.status === "present").length;
  const totalClasses = attendance.length;
  const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <img src={logo} alt="Logo" className="h-7 w-7 rounded" />
          <h1 className="font-display text-lg font-bold">Attendance Tracker</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Overall summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" /> Overall Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">{overallPct}%</span>
              <Badge variant={overallPct >= 75 ? "default" : "destructive"}>
                {overallPct >= 75 ? "Good Standing" : "Low Attendance"}
              </Badge>
            </div>
            <Progress value={overallPct} className="h-3" />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {totalPresent} Present</span>
              <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" /> {totalClasses - totalPresent} Absent</span>
              <span>Total: {totalClasses} classes</span>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : subjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No attendance records yet</p>
              <p className="text-sm">Your attendance will appear here once marked by faculty.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map(([sid, s]) => {
              const pct = Math.round((s.present / s.total) * 100);
              return (
                <Card key={sid} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{s.name}</h3>
                        <p className="text-xs text-muted-foreground">{s.code}</p>
                      </div>
                      <Badge variant={pct >= 75 ? "secondary" : "destructive"} className="text-xs">
                        {pct >= 75 ? null : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {pct}%
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{s.present} present</span>
                      <span>{s.absent} absent</span>
                      <span>{s.total} total</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceTracker;
