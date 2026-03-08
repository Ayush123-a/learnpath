import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, XCircle, Users, Save, RotateCcw } from "lucide-react";

const FacultyAttendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent">>({});

  // Fetch all subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name, code").order("name");
      return data || [];
    },
  });

  // Fetch students (all profiles with student role)
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students-for-attendance"],
    queryFn: async () => {
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");
      if (!studentRoles?.length) return [];
      const userIds = studentRoles.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, student_id")
        .in("user_id", userIds)
        .order("full_name");
      return profiles || [];
    },
  });

  // Fetch existing attendance for selected subject + date
  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["existing-attendance", selectedSubject, selectedDate],
    enabled: !!selectedSubject && !!selectedDate,
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("subject_id", selectedSubject)
        .eq("date", selectedDate);
      return data || [];
    },
  });

  // Populate attendanceMap when existing data loads
  const initFromExisting = () => {
    const map: Record<string, "present" | "absent"> = {};
    existingAttendance.forEach((a: any) => {
      map[a.student_id] = a.status as "present" | "absent";
    });
    // Fill missing students as "present" by default
    students.forEach((s: any) => {
      if (!map[s.user_id]) map[s.user_id] = "present";
    });
    setAttendanceMap(map);
  };

  // Initialize when subject/date/students change
  useState(() => {
    if (students.length > 0) initFromExisting();
  });

  const toggleStatus = (userId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [userId]: prev[userId] === "present" ? "absent" : "present",
    }));
  };

  const markAll = (status: "present" | "absent") => {
    const map: Record<string, "present" | "absent"> = {};
    students.forEach((s: any) => {
      map[s.user_id] = status;
    });
    setAttendanceMap(map);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubject || !selectedDate) throw new Error("Select subject and date");
      
      // Delete existing records for this subject+date, then insert fresh
      await supabase
        .from("attendance")
        .delete()
        .eq("subject_id", selectedSubject)
        .eq("date", selectedDate);

      const rows = Object.entries(attendanceMap).map(([studentId, status]) => ({
        student_id: studentId,
        subject_id: selectedSubject,
        date: selectedDate,
        status,
        marked_by: user!.id,
      }));

      const { error } = await supabase.from("attendance").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Attendance saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["existing-attendance"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "absent").length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setAttendanceMap({}); }}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setAttendanceMap({}); }} />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={initFromExisting} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Load
              </Button>
              <Button onClick={() => saveMutation.mutate()} disabled={!selectedSubject || saveMutation.isPending} className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions + summary */}
      {selectedSubject && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => markAll("present")} className="gap-1.5 border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll("absent")} className="gap-1.5 border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
            <XCircle className="h-3.5 w-3.5" /> Mark All Absent
          </Button>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" /> {presentCount}
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="h-3 w-3" /> {absentCount}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {students.length} total
            </span>
          </div>
        </div>
      )}

      {/* Student list */}
      {!selectedSubject ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Select a subject to mark attendance</p>
          </CardContent>
        </Card>
      ) : loadingStudents ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {students.map((student: any, idx: number) => {
            const status = attendanceMap[student.user_id] || "present";
            const isPresent = status === "present";
            return (
              <Card
                key={student.user_id}
                className={`cursor-pointer transition-all border ${
                  isPresent
                    ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/10"
                    : "border-red-500/20 bg-red-50/50 dark:bg-red-950/10"
                } hover:shadow-sm`}
                onClick={() => toggleStatus(student.user_id)}
              >
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <span className="text-sm font-medium text-muted-foreground w-8">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{student.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.student_id || student.email}
                    </p>
                  </div>
                  <Badge
                    variant={isPresent ? "default" : "destructive"}
                    className={`min-w-[70px] justify-center ${
                      isPresent ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                  >
                    {isPresent ? "Present" : "Absent"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
