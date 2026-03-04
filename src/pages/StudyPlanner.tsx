import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Clock, Plus, Flame, Target } from "lucide-react";
import { format, subDays, isToday } from "date-fns";
import logo from "@/assets/logo.png";

const StudyPlanner = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [minutes, setMinutes] = useState("");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["study-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .gte("session_date", format(subDays(new Date(), 30), "yyyy-MM-dd"))
        .order("session_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const logSession = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("study_sessions").insert({
        user_id: user!.id,
        duration_minutes: parseInt(minutes),
        session_date: format(new Date(), "yyyy-MM-dd"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Study session logged!" });
      setSubject("");
      setMinutes("");
      qc.invalidateQueries({ queryKey: ["study-sessions"] });
    },
    onError: () => toast({ title: "Error logging session", variant: "destructive" }),
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const todayMins = sessions
    .filter((s: any) => isToday(new Date(s.session_date)))
    .reduce((sum: number, s: any) => sum + s.duration_minutes, 0);

  const last7 = sessions.filter((s: any) => {
    const d = new Date(s.session_date);
    return d >= subDays(new Date(), 7);
  });
  const weekMins = last7.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);

  // Streak calculation
  let streak = 0;
  const dateSet = new Set(sessions.map((s: any) => s.session_date));
  for (let i = 0; i < 365; i++) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (dateSet.has(d)) streak++;
    else break;
  }

  const totalMins = sessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <img src={logo} alt="Logo" className="h-7 w-7 rounded" />
          <h1 className="font-display text-lg font-bold">Study Planner</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{todayMins}m</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{Math.round(weekMins / 60)}h</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
              <p className="text-2xl font-bold text-foreground">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{Math.round(totalMins / 60)}h</p>
              <p className="text-xs text-muted-foreground">Total (30d)</p>
            </CardContent>
          </Card>
        </div>

        {/* Log form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Log Study Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input id="subject" placeholder="e.g. Data Structures" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="minutes">Duration (minutes)</Label>
                <Input id="minutes" type="number" placeholder="e.g. 45" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={() => logSession.mutate()}
              disabled={!minutes || parseInt(minutes) < 1 || logSession.isPending}
            >
              {logSession.isPending ? "Logging..." : "Log Session"}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No study sessions logged yet. Start tracking!</p>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 20).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(s.session_date), "EEE, MMM d")}
                      </p>
                    </div>
                    <Badge variant="secondary">{s.duration_minutes} min</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudyPlanner;
