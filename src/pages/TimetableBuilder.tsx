import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react";
import logo from "@/assets/logo.png";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COLORS = ["#4F46E5", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777"];

interface TimetableEntry {
  id: string;
  user_id: string;
  subject_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  teacher_name: string | null;
  color: string | null;
}

const TimetableBuilder = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject_name: "", day_of_week: "0", start_time: "09:00", end_time: "10:00", room: "", teacher_name: "", color: COLORS[0] });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["timetable", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as TimetableEntry[];
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("timetable_entries").insert({
        user_id: user!.id,
        subject_name: form.subject_name,
        day_of_week: parseInt(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room || null,
        teacher_name: form.teacher_name || null,
        color: form.color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Class added!" });
      setOpen(false);
      setForm({ subject_name: "", day_of_week: "0", start_time: "09:00", end_time: "10:00", room: "", teacher_name: "", color: COLORS[0] });
      qc.invalidateQueries({ queryKey: ["timetable"] });
    },
    onError: () => toast({ title: "Error adding class", variant: "destructive" }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Class removed" });
      qc.invalidateQueries({ queryKey: ["timetable"] });
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <img src={logo} alt="Logo" className="h-7 w-7 rounded" />
            <h1 className="font-display text-lg font-bold">Timetable</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Class to Timetable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Subject Name *</Label>
                  <Input placeholder="e.g. Data Structures" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Day</Label>
                    <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-1.5 mt-1.5">
                      {COLORS.map((c) => (
                        <button key={c} onClick={() => setForm({ ...form, color: c })}
                          className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Room</Label>
                    <Input placeholder="e.g. Room 201" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
                  </div>
                  <div>
                    <Label>Teacher</Label>
                    <Input placeholder="e.g. Dr. Sharma" value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={() => addEntry.mutate()} disabled={!form.subject_name || addEntry.isPending}>
                  {addEntry.isPending ? "Adding..." : "Add Class"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No classes added yet</p>
              <p className="text-sm">Click "Add Class" to build your weekly timetable.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {DAYS.map((day, dayIdx) => {
              const dayEntries = entries.filter((e) => e.day_of_week === dayIdx);
              if (dayEntries.length === 0) return null;
              return (
                <div key={day}>
                  <h2 className="font-display text-lg font-semibold text-foreground mb-3">{day}</h2>
                  <div className="space-y-2">
                    {dayEntries.map((e) => (
                      <Card key={e.id} className="overflow-hidden">
                        <div className="flex">
                          <div className="w-1.5 shrink-0" style={{ backgroundColor: e.color || "#4F46E5" }} />
                          <CardContent className="flex-1 flex items-center justify-between p-4">
                            <div>
                              <h3 className="font-semibold text-foreground">{e.subject_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {e.start_time?.slice(0, 5)} – {e.end_time?.slice(0, 5)}
                                {e.room && ` · ${e.room}`}
                                {e.teacher_name && ` · ${e.teacher_name}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteEntry.mutate(e.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TimetableBuilder;
