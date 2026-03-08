import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UserCheck, Trash2, Plus } from "lucide-react";

const CollegeAdminFaculty = () => {
  const { user, collegeId } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Get faculty users in this college
  const { data: facultyUsers = [] } = useQuery({
    queryKey: ["college-faculty-users", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      // Get user_ids with faculty role in this college
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "faculty");
      if (!roles?.length) return [];
      const facultyIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("college_id", collegeId!)
        .in("user_id", facultyIds);
      return profiles || [];
    },
  });

  // Get subjects via degrees -> years -> semesters -> subjects for this college
  const { data: subjects = [] } = useQuery({
    queryKey: ["college-subjects", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data: degrees } = await supabase
        .from("degrees")
        .select("id")
        .eq("college_id", collegeId!);
      if (!degrees?.length) return [];
      const degreeIds = degrees.map((d) => d.id);
      const { data: years } = await supabase
        .from("years")
        .select("id")
        .in("degree_id", degreeIds);
      if (!years?.length) return [];
      const yearIds = years.map((y) => y.id);
      const { data: semesters } = await supabase
        .from("semesters")
        .select("id")
        .in("year_id", yearIds);
      if (!semesters?.length) return [];
      const semesterIds = semesters.map((s) => s.id);
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("id, name, code")
        .in("semester_id", semesterIds)
        .order("name");
      return subjectsData || [];
    },
  });

  // Get current assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["faculty-subject-assignments", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("faculty_subjects")
        .select("id, faculty_user_id, subject_id, assigned_at")
        .eq("college_id", collegeId!)
        .order("assigned_at", { ascending: false });
      return (data as any[]) || [];
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("faculty_subjects").insert({
        faculty_user_id: selectedFaculty,
        subject_id: selectedSubject,
        college_id: collegeId!,
        assigned_by: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-subject-assignments"] });
      toast.success("Faculty assigned to subject");
      setSelectedFaculty("");
      setSelectedSubject("");
    },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "Already assigned" : e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faculty_subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-subject-assignments"] });
      toast.success("Assignment removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getFacultyName = (userId: string) => {
    const f = facultyUsers.find((u: any) => u.user_id === userId);
    return f ? (f as any).full_name || (f as any).email : "Unknown";
  };

  const getSubjectName = (subjectId: string) => {
    const s = subjects.find((s: any) => s.id === subjectId);
    return s ? `${(s as any).name} (${(s as any).code})` : "Unknown";
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Assign form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Assign Faculty to Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select faculty member" /></SelectTrigger>
              <SelectContent>
                {facultyUsers.map((f: any) => (
                  <SelectItem key={f.user_id} value={f.user_id}>{f.full_name || f.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedFaculty || !selectedSubject || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" /> Assign
            </Button>
          </div>
          {facultyUsers.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">No faculty members found in your college. Assign the faculty role first in the Users tab.</p>
          )}
          {subjects.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">No subjects found. Create degrees and subjects first in the Degrees tab.</p>
          )}
        </CardContent>
      </Card>

      {/* Current assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Current Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No faculty-subject assignments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{getFacultyName(a.faculty_user_id)}</TableCell>
                    <TableCell><Badge variant="outline">{getSubjectName(a.subject_id)}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(a.assigned_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => removeMutation.mutate(a.id)}><Trash2 className="h-3 w-3" /></Button>
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

export default CollegeAdminFaculty;
