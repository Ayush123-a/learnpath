import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserCheck, UserX, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface PendingUser {
  user_id: string;
  full_name: string;
  email: string;
  student_id: string | null;
  created_at: string;
  approval_status: string;
  roles: string[];
}

const CollegeAdminApprovals = () => {
  const { user, collegeId } = useAuth();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchUsers = async () => {
    if (!collegeId) return;
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("college_id", collegeId)
      .order("created_at", { ascending: false });

    if (profiles) {
      const userIds = profiles.map((p) => p.user_id);
      const { data: allRoles } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      const mapped: PendingUser[] = profiles.map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        student_id: p.student_id,
        created_at: p.created_at,
        approval_status: (p as any).approval_status || "pending",
        roles: (allRoles || []).filter((r) => r.user_id === p.user_id).map((r) => r.role),
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [collegeId]);

  const updateApproval = async (userId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("profiles")
      .update({ approval_status: status } as any)
      .eq("user_id", userId);

    if (error) return toast.error(error.message);

    // Send notification to the user
    if (user) {
      await supabase.from("notifications").insert({
        title: status === "approved" ? "Account Approved! 🎉" : "Account Request Denied",
        message: status === "approved"
          ? "Your college account has been approved. You now have full access to courses and resources."
          : "Your college account request has been denied. Please contact your college administration for more information.",
        sent_by: user.id,
        target_user_id: userId,
        college_id: collegeId,
      });
    }

    toast.success(status === "approved" ? "User approved successfully" : "User rejected");
    fetchUsers();
  };

  const suspendUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ approval_status: "suspended" } as any)
      .eq("user_id", userId);

    if (error) return toast.error(error.message);

    if (user) {
      await supabase.from("notifications").insert({
        title: "Account Suspended",
        message: "Your college account has been suspended. Please contact your college administration.",
        sent_by: user.id,
        target_user_id: userId,
        college_id: collegeId,
      });
    }

    toast.success("User suspended");
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    return u.approval_status === filter;
  });

  const pendingCount = users.filter((u) => u.approval_status === "pending").length;
  const approvedCount = users.filter((u) => u.approval_status === "approved").length;
  const rejectedCount = users.filter((u) => u.approval_status === "rejected").length;

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success border-success/30 gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case "suspended":
        return <Badge className="bg-warning/10 text-warning border-warning/30 gap-1"><AlertTriangle className="h-3 w-3" /> Suspended</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" /> User Approvals
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="pending" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              <XCircle className="h-3.5 w-3.5" /> Rejected ({rejectedCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">All ({users.length})</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No {filter === "all" ? "" : filter} users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Student ID</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{u.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{u.student_id || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(u.approval_status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {u.approval_status === "pending" && (
                            <>
                              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => updateApproval(u.user_id, "approved")}>
                                <UserCheck className="h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => updateApproval(u.user_id, "rejected")}>
                                <UserX className="h-3 w-3" /> Reject
                              </Button>
                            </>
                          )}
                          {u.approval_status === "approved" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-warning border-warning/30" onClick={() => suspendUser(u.user_id)}>
                              <AlertTriangle className="h-3 w-3" /> Suspend
                            </Button>
                          )}
                          {(u.approval_status === "rejected" || u.approval_status === "suspended") && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateApproval(u.user_id, "approved")}>
                              <UserCheck className="h-3 w-3" /> Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CollegeAdminApprovals;
