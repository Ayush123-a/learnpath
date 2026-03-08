import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Send, Trash2 } from "lucide-react";

const CollegeAdminNotifications = () => {
  const { user, collegeId } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    if (!collegeId) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("college_id", collegeId)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [collegeId]);

  const sendNotification = async () => {
    if (!title || !message) return toast.error("Title and message required");
    if (!user || !collegeId) return;
    setSending(true);
    const { error } = await supabase.from("notifications").insert({
      title,
      message,
      target_role: targetRole === "all" ? null : targetRole,
      sent_by: user.id,
      college_id: collegeId,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success("Notification sent to college members!");
    setTitle("");
    setMessage("");
    setTargetRole("all");
    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    toast.success("Notification deleted");
    fetchNotifications();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send College Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Exam schedule update" /></div>
            <div><Label>Target Audience</Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All College Members</SelectItem>
                  <SelectItem value="student">Students Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                  <SelectItem value="parent">Parents Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Message</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your notification message..." rows={3} /></div>
          <Button onClick={sendNotification} disabled={sending} className="gap-2">
            <Bell className="h-4 w-4" /> {sending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification History ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No notifications sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{n.message}</TableCell>
                      <TableCell><Badge variant="secondary">{n.target_role || "All"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deleteNotification(n.id)}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeAdminNotifications;
