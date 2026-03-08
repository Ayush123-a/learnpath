import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ShieldCheck, Check, X } from "lucide-react";

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  created_at: string;
  profile?: { full_name: string; email: string };
}

const AdminRoleRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("role_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profiles for each request
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const enriched = data.map(r => ({
        ...r,
        profile: profiles?.find(p => p.user_id === r.user_id),
      }));
      setRequests(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (req: RoleRequest) => {
    // Add the role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: req.user_id,
      role: req.requested_role as any,
    });
    if (roleError) {
      toast.error(roleError.message);
      return;
    }

    // Update request status
    await supabase
      .from("role_requests")
      .update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);

    toast.success(`Approved ${req.profile?.full_name || "user"} as ${req.requested_role}`);
    fetchRequests();
  };

  const handleReject = async (req: RoleRequest) => {
    await supabase
      .from("role_requests")
      .update({ status: "rejected", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);

    toast.info(`Rejected role request from ${req.profile?.full_name || "user"}`);
    fetchRequests();
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-500/10 text-green-700";
    if (status === "rejected") return "bg-destructive/10 text-destructive";
    return "bg-yellow-500/10 text-yellow-700";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Role Requests
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No role requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.profile?.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{req.profile?.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{req.requested_role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${statusColor(req.status)}`}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {req.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" onClick={() => handleApprove(req)} className="gap-1 h-7">
                            <Check className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(req)} className="gap-1 h-7">
                            <X className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Reviewed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRoleRequests;
