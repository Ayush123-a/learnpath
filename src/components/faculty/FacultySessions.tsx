import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Video, MessageSquare, BookOpen, Copy, Users, Trash2, Link2, FileText } from "lucide-react";

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const sessionTypeConfig = {
  live_video: { label: "Live Video", icon: Video, color: "bg-info/10 text-info" },
  study_session: { label: "Study Session", icon: BookOpen, color: "bg-success/10 text-success" },
  live_chat: { label: "Live Q&A", icon: MessageSquare, color: "bg-warning/10 text-warning" },
};

const FacultySessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editSession, setEditSession] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    session_type: "live_video",
    meeting_link: "",
    scheduled_at: "",
    duration_minutes: 60,
  });

  // Get faculty's college_id
  const { data: profile } = useQuery({
    queryKey: ["faculty-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("college_id")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["faculty-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("created_by", user?.id ?? "")
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: participantCounts = {} } = useQuery({
    queryKey: ["session-participant-counts"],
    queryFn: async () => {
      const sessionIds = sessions.map((s: any) => s.id);
      if (!sessionIds.length) return {};
      const { data, error } = await supabase
        .from("session_participants")
        .select("session_id")
        .in("session_id", sessionIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((p: any) => {
        counts[p.session_id] = (counts[p.session_id] || 0) + 1;
      });
      return counts;
    },
    enabled: sessions.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase.from("sessions").insert({
        title: values.title,
        description: values.description,
        session_type: values.session_type,
        meeting_link: values.meeting_link || null,
        scheduled_at: values.scheduled_at,
        duration_minutes: values.duration_minutes,
        invite_code: generateInviteCode(),
        created_by: user!.id,
        college_id: profile?.college_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-sessions"] });
      toast.success("Session created!");
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { error } = await supabase.from("sessions").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-sessions"] });
      toast.success("Session updated!");
      setEditSession(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-sessions"] });
      toast.success("Session deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => setForm({ title: "", description: "", session_type: "live_video", meeting_link: "", scheduled_at: "", duration_minutes: 60 });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">Sessions</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Create live classes, study sessions, and Q&A rooms</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-3 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Create Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input placeholder="Session title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[60px]" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.session_type} onValueChange={(v) => setForm({ ...form, session_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live_video">Live Video Class</SelectItem>
                    <SelectItem value="study_session">Scheduled Study Session</SelectItem>
                    <SelectItem value="live_chat">Live Chat / Q&A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.session_type === "live_video" && (
                <div>
                  <Label>Meeting Link (Zoom/Meet)</Label>
                  <Input placeholder="https://..." value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} />
                </div>
              </div>
              <Button className="w-full" disabled={!form.title || !form.scheduled_at || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
                {createMutation.isPending ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No sessions yet. Create your first session!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {sessions.map((session: any) => {
            const config = sessionTypeConfig[session.session_type as keyof typeof sessionTypeConfig] || sessionTypeConfig.live_video;
            const Icon = config.icon;
            const isLive = session.status === "live";
            const isPast = new Date(session.scheduled_at) < new Date() && session.status !== "live";

            return (
              <Card key={session.id} className={`overflow-hidden ${isLive ? "ring-2 ring-success" : ""}`}>
                <div className={`h-1 ${isLive ? "bg-success" : isPast ? "bg-muted" : "bg-primary"}`} />
                <CardContent className="p-3 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className={`rounded-lg p-2 ${config.color} flex-shrink-0 self-start`}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-sm md:text-base text-foreground">{session.title}</h3>
                        <Badge variant={isLive ? "default" : isPast ? "secondary" : "outline"} className="text-[10px] md:text-xs">
                          {isLive ? "🔴 LIVE" : isPast ? "Ended" : "Scheduled"}
                        </Badge>
                      </div>
                      {session.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{session.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-xs text-muted-foreground">
                        <span>{new Date(session.scheduled_at).toLocaleString()}</span>
                        <span>{session.duration_minutes} min</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {participantCounts[session.id] || 0} joined
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 md:h-8" onClick={() => copyCode(session.invite_code)}>
                          <Copy className="h-3 w-3" /> {session.invite_code}
                        </Button>
                        {!isPast && (
                          <Button
                            variant={isLive ? "destructive" : "default"}
                            size="sm"
                            className="text-xs h-7 md:h-8"
                            onClick={() =>
                              updateMutation.mutate({
                                id: session.id,
                                status: isLive ? "ended" : "live",
                                ...(isLive ? { ended_at: new Date().toISOString() } : {}),
                              })
                            }
                          >
                            {isLive ? "End Session" : "Go Live"}
                          </Button>
                        )}

                        {/* Edit recording/notes for ended sessions */}
                        {isPast && !editSession && (
                          <Button variant="ghost" size="sm" className="text-xs h-7 md:h-8 gap-1" onClick={() => setEditSession(session)}>
                            <FileText className="h-3 w-3" /> Add Recording/Notes
                          </Button>
                        )}

                        <Button variant="ghost" size="sm" className="text-xs h-7 md:h-8 text-destructive" onClick={() => deleteMutation.mutate(session.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {editSession?.id === session.id && (
                        <div className="space-y-2 pt-2 border-t border-border mt-2">
                          <div>
                            <Label className="text-xs">Recording Link</Label>
                            <Input
                              placeholder="https://..."
                              defaultValue={session.recording_link || ""}
                              onChange={(e) => setEditSession({ ...editSession, recording_link: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Session Notes</Label>
                            <Textarea
                              placeholder="Add notes or summary..."
                              defaultValue={session.notes_content || ""}
                              onChange={(e) => setEditSession({ ...editSession, notes_content: e.target.value })}
                              className="min-h-[50px] text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="text-xs h-7"
                              onClick={() =>
                                updateMutation.mutate({
                                  id: session.id,
                                  recording_link: editSession.recording_link || null,
                                  notes_content: editSession.notes_content || null,
                                })
                              }
                            >
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditSession(null)}>
                              Cancel
                            </Button>
                          </div>
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
  );
};

export default FacultySessions;
