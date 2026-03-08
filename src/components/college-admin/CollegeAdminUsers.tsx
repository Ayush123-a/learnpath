import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Trash2, Users } from "lucide-react";

interface UserWithRoles {
  user_id: string;
  full_name: string;
  email: string;
  student_id: string | null;
  created_at: string;
  roles: AppRole[];
}

const ASSIGNABLE_ROLES: AppRole[] = ["student", "faculty", "parent", "content_creator"];

const CollegeAdminUsers = () => {
  const { collegeId } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    if (!collegeId) return;
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("college_id", collegeId)
      .order("created_at", { ascending: false });
    
    if (profiles) {
      const userIds = profiles.map(p => p.user_id);
      const { data: allRoles } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      const mapped: UserWithRoles[] = profiles.map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        student_id: p.student_id,
        created_at: p.created_at,
        roles: (allRoles || []).filter((r) => r.user_id === p.user_id).map((r) => r.role as AppRole),
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [collegeId]);

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success(`Added ${role} role`);
    fetchUsers();
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${role} role`);
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> College Users ({users.length})
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or student ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No users found in your college.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Add Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell className="text-sm">{u.student_id || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="gap-1 text-xs">
                            {r}
                            {r !== "college_admin" && (
                              <button onClick={() => removeRole(u.user_id, r)} className="ml-1 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(val) => addRole(u.user_id, val as AppRole)}>
                        <SelectTrigger className="w-36 h-8">
                          <SelectValue placeholder="Add role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
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

export default CollegeAdminUsers;
