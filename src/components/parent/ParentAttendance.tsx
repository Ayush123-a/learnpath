import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const ParentAttendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: links } = await supabase
        .from("parent_students")
        .select("student_id")
        .eq("parent_id", user.id);

      if (links && links.length > 0) {
        const studentIds = links.map((l) => l.student_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", studentIds);
        setStudents(profiles || []);
        if (profiles && profiles.length > 0) {
          setSelectedStudent(profiles[0].user_id);
        }
      }
      const { data: subs } = await supabase.from("subjects").select("*");
      setSubjects(subs || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  useEffect(() => {
    if (!selectedStudent) return;
    const fetchAttendance = async () => {
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", selectedStudent)
        .order("date", { ascending: false })
        .limit(100);
      setAttendance(data || []);
    };
    fetchAttendance();
  }, [selectedStudent]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No students linked to your account yet. Contact the admin to link your child's account.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate per-subject stats
  const subjectStats = subjects.map((sub) => {
    const records = attendance.filter((a) => a.subject_id === sub.id);
    const present = records.filter((a) => a.status === "present").length;
    const total = records.length;
    return { ...sub, present, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
  }).filter((s) => s.total > 0);

  const totalPresent = attendance.filter((a) => a.status === "present").length;
  const overallPct = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0;

  const statusIcon = (status: string) => {
    if (status === "present") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "absent") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {students.length > 1 && (
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.user_id} value={s.user_id}>{s.full_name || s.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-primary">{overallPct}%</p>
            <p className="text-sm text-muted-foreground">Overall Attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{totalPresent}</p>
            <p className="text-sm text-muted-foreground">Days Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{attendance.filter((a) => a.status === "absent").length}</p>
            <p className="text-sm text-muted-foreground">Days Absent</p>
          </CardContent>
        </Card>
      </div>

      {subjectStats.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Subject-wise Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {subjectStats.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.present}/{s.total} ({s.percentage}%)</span>
                </div>
                <Progress value={s.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent Records</CardTitle></CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No attendance records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.slice(0, 20).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                    <TableCell>{subjects.find((s) => s.id === a.subject_id)?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        {statusIcon(a.status)} {a.status}
                      </Badge>
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

export default ParentAttendance;
