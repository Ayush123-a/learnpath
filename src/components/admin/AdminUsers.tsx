import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, Users } from "lucide-react";
import type { AppRole } from "@/hooks/useAuth";

interface UserWithRoles {
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  roles: AppRole[];
}

const ALL_ROLES: AppRole[] = ["student", "faculty", "admin", "parent", "content_creator"];

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: allRoles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const mapped: UserWithRoles[] = profiles.map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        created_at: p.created_at,
        roles: (allRoles || []).filter((r) => r.user_id === p.user_id).map((r) => r.role as AppRole),
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added ${role} role`);
      fetchUsers();
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Removed ${role} role`);
      fetchUsers();
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Management ({users.length})</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
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
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant="secondary" className="gap-1 text-xs">
                              {r}
                              <button onClick={() => removeRole(u.user_id, r)} className="ml-1 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
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
                            {ALL_ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
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
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filtered.map((u) => (
                <Card key={u.user_id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{u.full_name || "—"}</h3>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Roles:</p>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant="secondary" className="gap-1 text-xs">
                              {r}
                              <button onClick={() => removeRole(u.user_id, r)} className="ml-1 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Add Role:</p>
                        <Select onValueChange={(val) => addRole(u.user_id, val as AppRole)}>
                          <SelectTrigger className="w-full h-8">
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
