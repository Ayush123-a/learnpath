import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const FacultyAssignedSubjects = () => {
  const { user } = useAuth();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["my-subject-assignments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("faculty_subjects")
        .select("id, subject_id, assigned_at")
        .eq("faculty_user_id", user!.id);
      return (data as any[]) || [];
    },
  });

  // Fetch subject details
  const { data: subjects = [] } = useQuery({
    queryKey: ["assigned-subject-details", assignments.map((a: any) => a.subject_id)],
    enabled: assignments.length > 0,
    queryFn: async () => {
      const ids = assignments.map((a: any) => a.subject_id);
      const { data } = await supabase
        .from("subjects")
        .select("id, name, code, credits, semesters(label, years(label, degrees(name)))")
        .in("id", ids);
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-4"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (assignments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No subjects assigned yet. Your college admin will assign you to subjects.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" /> My Assigned Subjects ({subjects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {subjects.map((s: any) => {
            const sem = s.semesters;
            const year = sem?.years;
            const degree = year?.degrees;
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {degree?.name} · {year?.label} · {sem?.label}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{s.code}</Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyAssignedSubjects;
