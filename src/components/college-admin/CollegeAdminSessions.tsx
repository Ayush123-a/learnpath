import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Video, Trash2, Users, Copy } from "lucide-react";

const CollegeAdminSessions = () => {
  const { collegeId } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["college-admin-sessions", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("college_id", collegeId!)
        .order("scheduled_at", { ascending: false });
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["college-admin-sessions"] });
      toast.success("Session deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const statusBadge = (s: any) => {
    if (s.status === "live") return <Badge variant="default">🔴 Live</Badge>;
    if (s.status === "ended" || new Date(s.scheduled_at) < new Date()) return <Badge variant="secondary">Ended</Badge>;
    return <Badge variant="outline">Scheduled</Badge>;
  };

  const typeLabels: Record<string, string> = { live_video: "Live Video", study_session: "Study Session", live_chat: "Q&A Chat" };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Sessions ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No sessions created for your college yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell><Badge variant="outline">{typeLabels[s.session_type] || s.session_type}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(s.scheduled_at).toLocaleString()}</TableCell>
                    <TableCell>{statusBadge(s)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => copyCode(s.invite_code)}>
                        <Copy className="h-3 w-3" /> {s.invite_code}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="h-3 w-3" /></Button>
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

export default CollegeAdminSessions;
