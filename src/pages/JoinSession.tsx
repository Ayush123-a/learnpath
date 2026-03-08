import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Video, MessageSquare, BookOpen, Users, ExternalLink, FileText, Play } from "lucide-react";
import logo from "@/assets/logo.png";

const sessionTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  live_video: { label: "Live Video", icon: Video, color: "bg-info/10 text-info" },
  study_session: { label: "Study Session", icon: BookOpen, color: "bg-success/10 text-success" },
  live_chat: { label: "Live Q&A", icon: MessageSquare, color: "bg-warning/10 text-warning" },
};

const JoinSession = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  // Fetch sessions user has joined
  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ["my-sessions", user.id],
    queryFn: async () => {
      const { data: participations, error: pErr } = await supabase
        .from("session_participants")
        .select("session_id")
        .eq("user_id", user.id);
      if (pErr) throw pErr;
      if (!participations.length) return [];
      const sessionIds = participations.map((p) => p.session_id);
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .in("id", sessionIds)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      // Find session by invite code
      const { data: session, error: findErr } = await supabase
        .from("sessions")
        .select("id, title, status")
        .eq("invite_code", code.toUpperCase().trim())
        .maybeSingle();
      if (findErr) throw findErr;
      if (!session) throw new Error("Invalid invite code. Please check and try again.");

      // Check if already joined
      const { data: existing } = await supabase
        .from("session_participants")
        .select("id")
        .eq("session_id", session.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) throw new Error("You've already joined this session!");

      // Join
      const { error: joinErr } = await supabase.from("session_participants").insert({
        session_id: session.id,
        user_id: user.id,
        attendance_marked: true,
      });
      if (joinErr) throw joinErr;
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      toast.success(`Joined "${session.title}" successfully!`);
      setInviteCode("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="px-3 md:container flex h-14 items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Learn Path" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              Live <span className="text-primary">Sessions</span>
            </span>
          </div>
        </div>
      </header>

      <main className="px-3 md:container py-4 md:py-6 space-y-5 md:space-y-6 max-w-2xl mx-auto">
        {/* Join with code */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg">Join a Session</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter invite code (e.g. ABC123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="uppercase tracking-widest font-mono text-center"
                maxLength={6}
              />
              <Button
                disabled={inviteCode.length < 4 || joinMutation.isPending}
                onClick={() => joinMutation.mutate(inviteCode)}
                className="flex-shrink-0"
              >
                {joinMutation.isPending ? "Joining..." : "Join"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Sessions */}
        <div>
          <h2 className="text-base md:text-lg font-bold text-foreground mb-3">My Sessions</h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : mySessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No sessions yet. Enter an invite code above to join one!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {mySessions.map((session: any) => {
                const config = sessionTypeConfig[session.session_type] || sessionTypeConfig.live_video;
                const Icon = config.icon;
                const isLive = session.status === "live";
                const isPast = new Date(session.scheduled_at) < new Date() && session.status !== "live";

                return (
                  <Card key={session.id} className={`overflow-hidden ${isLive ? "ring-2 ring-success" : ""}`}>
                    <div className={`h-1 ${isLive ? "bg-success animate-pulse" : isPast ? "bg-muted" : "bg-primary"}`} />
                    <CardContent className="p-3 md:p-5">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${config.color} flex-shrink-0`}>
                          <Icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-sm md:text-base text-foreground">{session.title}</h3>
                            <Badge variant={isLive ? "default" : isPast ? "secondary" : "outline"} className="text-[10px] md:text-xs">
                              {isLive ? "🔴 LIVE" : isPast ? "Ended" : "Upcoming"}
                            </Badge>
                          </div>
                          {session.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{session.description}</p>
                          )}
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            {new Date(session.scheduled_at).toLocaleString()} · {session.duration_minutes} min
                          </p>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {isLive && session.meeting_link && (
                              <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="gap-1.5 text-xs h-7 md:h-8">
                                  <ExternalLink className="h-3 w-3" /> Join Meeting
                                </Button>
                              </a>
                            )}
                            {session.recording_link && (
                              <a href={session.recording_link} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 md:h-8">
                                  <Play className="h-3 w-3" /> Recording
                                </Button>
                              </a>
                            )}
                            {session.notes_content && (
                              <Badge variant="secondary" className="gap-1 text-[10px]">
                                <FileText className="h-3 w-3" /> Notes available
                              </Badge>
                            )}
                          </div>

                          {session.notes_content && (
                            <div className="mt-2 p-2 rounded-md bg-muted text-xs text-muted-foreground">
                              {session.notes_content}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JoinSession;
